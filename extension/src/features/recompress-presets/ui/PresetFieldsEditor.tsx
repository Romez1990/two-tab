import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { SMART_TIME_HINT, SmartHint } from '@/shared/ui';
import {
  DEFAULT_FIELDS,
  describeStep,
  type PresetFields,
  SLIDERS,
  type SliderDef,
  type SliderField,
  trimError,
} from '../model/fields';

/** Form order, the same for "Download", "Compression queue" and settings (docs/extension/queues.md, section 1). */
const ORDER: SliderField[] = ['resolution', 'crf', 'fps', 'speed', 'opus_kbps', 'grain'];
const ORDERED = ORDER.map((field) => SLIDERS.find((s) => s.field === field)!);

/**
 * Preset fields (tidy-reel/docs/recompress.md, section 2). `base` is "Default": a site preset field
 * without the "own" checkbox is taken from it. The same editor is used in the "Download" window for one-time edits.
 */
export function PresetFieldsEditor({
  fields,
  base,
  onChange,
}: {
  fields: Partial<PresetFields>;
  /** None means "Default" is being edited: all fields are its own. */
  base?: PresetFields;
  onChange: (fields: Partial<PresetFields>) => void;
}) {
  const full: PresetFields = { ...DEFAULT_FIELDS, ...base, ...fields };
  const own = (key: keyof PresetFields) => !base || key in fields;
  const set = <K extends keyof PresetFields>(key: K, value: PresetFields[K]) => onChange({ ...fields, [key]: value });
  const toggle = (key: keyof PresetFields, on: boolean) => {
    const next = { ...fields };
    if (on) Object.assign(next, { [key]: full[key] });
    else delete next[key];
    onChange(next);
  };
  const disabled = !full.enabled;

  const ownBox = (field: keyof PresetFields) =>
    base ? (
      <Tooltip title="Своё значение; без галочки — как в «По умолчанию»">
        <Checkbox size="small" checked={own(field)} onChange={(_, on) => toggle(field, on)} sx={{ p: 0.5 }} />
      </Tooltip>
    ) : null;

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        {ownBox('enabled')}
        <FormControlLabel
          disabled={!own('enabled')}
          control={<Checkbox checked={full.enabled} onChange={(_, on) => set('enabled', on)} />}
          label="Сжимать"
        />
      </Stack>
      {ORDERED.map((def) => (
        <SliderRow
          key={def.field}
          def={def}
          value={full[def.field]}
          disabled={disabled || !own(def.field)}
          own={ownBox(def.field)}
          onChange={(v) => set(def.field, v)}
        />
      ))}
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        {ownBox('normalize')}
        <FormControlLabel
          disabled={disabled || !own('normalize')}
          control={<Checkbox checked={full.normalize} onChange={(_, on) => set('normalize', on)} />}
          label="Нормализовать звук (−14 LUFS)"
        />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
        {ownBox('trim_start')}
        <TrimField
          label="Обрезать начало"
          value={full.trim_start}
          end={false}
          disabled={disabled || !own('trim_start')}
          onChange={(v) => set('trim_start', v)}
        />
        {ownBox('trim_end')}
        <TrimField
          label="Обрезать конец"
          value={full.trim_end}
          end
          disabled={disabled || !own('trim_end')}
          onChange={(v) => set('trim_end', v)}
        />
        <Box sx={{ pt: 2 }}>
          <SmartHint rows={SMART_TIME_HINT} />
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        {ownBox('bitrate_threshold')}
        <TextField
          type="number"
          size="small"
          label="Порог битрейта, кбит/с"
          helperText="Сжимать, только если битрейт исходника выше. 0 — сжимать всё."
          disabled={disabled || !own('bitrate_threshold')}
          value={Math.round(full.bitrate_threshold / 1000)}
          onChange={(e) => set('bitrate_threshold', Math.max(0, Math.round(Number(e.target.value) || 0)) * 1000)}
          sx={{ width: 320 }}
        />
      </Stack>
    </Stack>
  );
}

function SliderRow({
  def,
  value,
  disabled,
  own,
  onChange,
}: {
  def: SliderDef;
  value: number;
  disabled: boolean;
  own: React.ReactNode;
  onChange: (value: number) => void;
}) {
  const index = Math.max(
    0,
    def.steps.findIndex((s) => s.value === value),
  );
  const step = def.steps[index]!;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {own}
      <Box sx={{ width: 200, flexShrink: 0 }}>
        <Tooltip title={def.hint ?? ''}>
          <Typography variant="body2">{def.title}</Typography>
        </Tooltip>
      </Box>
      <Slider
        disabled={disabled}
        min={0}
        max={def.steps.length - 1}
        step={1}
        marks
        value={index}
        onChange={(_, i) => onChange(def.steps[i as number]!.value)}
        valueLabelDisplay="auto"
        valueLabelFormat={(i) => def.steps[i]!.label}
        sx={{ flex: 1 }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ width: 260, flexShrink: 0 }}>
        {step.label} · {describeStep(def, step)}
      </Typography>
    </Stack>
  );
}

function TrimField({
  label,
  value,
  end,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  end: boolean;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  const error = trimError(value, end);
  return (
    <TextField
      size="small"
      label={label}
      placeholder={end ? '-94f, -10.25, 3:40.5' : '94f, 12.5, 0:12.5'}
      value={value}
      disabled={disabled}
      error={Boolean(error)}
      helperText={error || ' '}
      onChange={(e) => onChange(e.target.value)}
      sx={{ width: 220 }}
    />
  );
}
