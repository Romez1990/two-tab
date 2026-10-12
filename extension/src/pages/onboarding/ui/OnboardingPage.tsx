import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { VideoAnalyzerConnection } from '@/features/connect-video-analyzer';
import { updateSettings, useSettings } from '@/shared/config';

/** Первый запуск (docs/extension/specification.md, раздел 1.1). Синхронизация появится на этапе 6. */
export function OnboardingPage() {
  const settings = useSettings();
  if (!settings) return null;

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
                key={settings.profileName}
                label="Название профиля"
                placeholder="Основной"
                defaultValue={settings.profileName}
                onBlur={(e) => void updateSettings({ profileName: e.target.value.trim() })}
                fullWidth
              />
            </Step>
            <Step
              title="2. Подключить к video-analyzer?"
              hint="Если на этом компьютере стоит video-analyzer: время просмотра, оценки, скачивание. Подключён может быть только один профиль Chrome."
            >
              <VideoAnalyzerConnection />
            </Step>
            <Step title="3. Синхронизация" hint="Синхронизация списка через сервер появится позже, на этапе 6." />
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
