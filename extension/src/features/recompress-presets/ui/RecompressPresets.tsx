import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { deletePreset, listPresets, PresetsUnavailableError, savePreset, type Preset } from '../api/presets';
import { DEFAULT_FIELDS, trimError, type PresetFields } from '../model/fields';
import { PresetFieldsEditor } from './PresetFieldsEditor';
import { errorText } from '@/shared/lib';

/** Preset draft on screen; no `id` means a new one. */
interface Draft {
  id?: number;
  name: string;
  sites: string[];
  fields: Partial<PresetFields>;
  isDefault: boolean;
}

/** Compression presets (docs/extension/pages/settings.md, section 4): "Default" and site presets. */
export function RecompressPresets() {
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [sites, setSites] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [unavailable, setUnavailable] = useState('');

  const reload = useCallback(() => {
    listPresets()
      .then(({ presets, sites }) => {
        setDrafts(presets.map(toDraft));
        setSites(sites);
      })
      .catch((e: unknown) => setUnavailable(e instanceof PresetsUnavailableError ? e.message : 'Локальный сервис Tidy Reel не отвечает'));
  }, []);
  useEffect(reload, [reload]);

  if (unavailable) return <Typography color="text.secondary">{unavailable}</Typography>;
  if (!drafts) return <Typography color="text.secondary">Загрузка…</Typography>;
  const base = { ...DEFAULT_FIELDS, ...(drafts.find((d) => d.isDefault)?.fields ?? {}) };
  const taken = (draft: Draft) => new Set(drafts.filter((d) => d !== draft).flatMap((d) => d.sites));

  const update = (draft: Draft, next: Partial<Draft>) => setDrafts((list) => list!.map((d) => (d === draft ? { ...d, ...next } : d)));

  async function save(draft: Draft) {
    const bad = trimError(draft.fields.trim_start ?? '', false) || trimError(draft.fields.trim_end ?? '', true);
    if (bad) {
      setMessage({ text: `Обрезка: ${bad}`, error: true });
      return;
    }
    try {
      await savePreset({ name: draft.name.trim(), sites: draft.sites, fields: draft.fields }, draft.id);
      setMessage({ text: `Пресет «${draft.name}» сохранён`, error: false });
      reload();
    } catch (e) {
      setMessage({ text: errorText(e), error: true });
    }
  }

  async function remove(draft: Draft) {
    if (draft.id === undefined) {
      setDrafts((list) => list!.filter((d) => d !== draft));
      return;
    }
    try {
      await deletePreset(draft.id);
      reload();
    } catch (e) {
      setMessage({ text: errorText(e), error: true });
    }
  }

  return (
    <Stack spacing={1}>
      {message && (
        <Alert severity={message.error ? 'error' : 'success'} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}
      {drafts.map((draft, i) => (
        <Accordion key={draft.id ?? `new${i}`} disableGutters variant="outlined" defaultExpanded={draft.id === undefined}>
          <AccordionSummary>
            <Stack>
              <Typography>{draft.name || 'Новый пресет'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {summary(draft)}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {!draft.isDefault && (
                <Stack direction="row" spacing={2}>
                  <TextField size="small" label="Название" value={draft.name} onChange={(e) => update(draft, { name: e.target.value })} sx={{ width: 220 }} />
                  <Autocomplete
                    multiple
                    size="small"
                    options={sites.filter((s) => !taken(draft).has(s))}
                    value={draft.sites}
                    onChange={(_, value) => update(draft, { sites: value })}
                    renderInput={(params) => <TextField {...params} label="Сайты" />}
                    sx={{ flex: 1 }}
                  />
                </Stack>
              )}
              <PresetFieldsEditor fields={draft.fields} base={draft.isDefault ? undefined : base} onChange={(fields) => update(draft, { fields })} />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" disabled={!draft.name.trim()} onClick={() => void save(draft)}>
                  Сохранить
                </Button>
                {!draft.isDefault && (
                  <Button color="warning" onClick={() => void remove(draft)}>
                    Удалить
                  </Button>
                )}
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
      <Button sx={{ alignSelf: 'flex-start' }} onClick={() => setDrafts((list) => [...list!, { name: '', sites: [], fields: {}, isDefault: false }])}>
        Добавить пресет сайта
      </Button>
    </Stack>
  );
}

function toDraft(preset: Preset): Draft {
  return { id: preset.id, name: preset.name, sites: preset.sites, fields: preset.fields as Partial<PresetFields>, isDefault: preset.is_default };
}

function summary(draft: Draft): string {
  if (draft.isDefault) return 'Для всех сайтов';
  const changed = Object.keys(draft.fields).length;
  const sites = draft.sites.length ? draft.sites.join(', ') : 'сайты не выбраны';
  return `${sites} · своих полей: ${changed}`;
}
