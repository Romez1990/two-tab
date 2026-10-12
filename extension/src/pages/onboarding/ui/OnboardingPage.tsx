import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/** Первый запуск (docs/extension/specification.md, раздел 1.1). Вопросы о профиле, video-analyzer и синхронизации — на следующих этапах. */
export function OnboardingPage() {
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
          <Typography color="text.secondary">
            Расширение уже сохраняет снимки окон и недавно закрытые вкладки. Настройка профиля появится здесь.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
