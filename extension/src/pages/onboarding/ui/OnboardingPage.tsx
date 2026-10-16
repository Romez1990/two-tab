import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { type ReactNode, useEffect, useState } from 'react';
import { TidyReelConnection } from '@/features/connect-tidy-reel';
import { updateSettings, useSettings } from '@/shared/config';

/** First run (docs/extension/pages/onboarding.md). Sync arrives in stage 6. */
export function OnboardingPage() {
  const settings = useSettings();
  const [name, setName] = useState<string>();
  useEffect(() => {
    if (settings && name === undefined) setName(settings.profileName);
  }, [settings, name]);
  if (!settings || name === undefined) return null;
  const named = name.trim() !== '';

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card variant="outlined">
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
            <CheckCircleOutlineIcon color="success" fontSize="large" />
            <Typography variant="h4" component="h1">
              Tabsurd установлен
            </Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Расширение уже сохраняет снимки окон и недавно закрытые вкладки. Всё ниже можно поменять потом в настройках.
          </Typography>
          <Stack spacing={4}>
            <Step title="1. Как назвать этот профиль?">
              <TextField
                label="Название профиля"
                placeholder="Основной"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  void updateSettings({ profileName: e.target.value.trim() });
                }}
                required
                error={!named}
                helperText={named ? 'Его видно в Tidy Reel.' : 'Обязательно: его видно в Tidy Reel.'}
                fullWidth
              />
            </Step>
            <Step
              title="2. Подключить к Tidy Reel?"
              hint="Если на этом компьютере стоит Tidy Reel: время просмотра, оценки, скачивание. Подключён может быть только один профиль Chrome."
            >
              <TidyReelConnection disabled={!named} />
            </Step>
            <Step title="3. Синхронизация" hint="Синхронизация списка через сервер появится позже, на этапе 6." />
            <Button variant="contained" disabled={!named} onClick={() => window.close()} sx={{ alignSelf: 'flex-end' }}>
              Готово
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

function Step({ title, hint, children }: { title: string; hint?: string; children?: ReactNode }) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="h6">{title}</Typography>
      {hint && <Typography color="text.secondary">{hint}</Typography>}
      {children}
    </Stack>
  );
}
