import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type ComponentType } from 'react';
import { RecoveryPage } from '@/pages/recovery';

/** Разделы главной страницы расширения по адресу после `#`. «Сохранённые» и «Окна» добавятся на этапе 3. */
const sections: Record<string, { title: string; page: ComponentType }> = {
  recovery: { title: 'Восстановление', page: RecoveryPage },
};
const DEFAULT_SECTION = 'recovery';

function currentSection(): string {
  const name = location.hash.slice(1);
  return name in sections ? name : DEFAULT_SECTION;
}

export function AppRouter() {
  const [section, setSection] = useState(currentSection);
  useEffect(() => {
    const onHash = () => setSection(currentSection());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const Page = sections[section]?.page ?? RecoveryPage;

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 4 }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Tabsurd
          </Typography>
          <Tabs value={section} onChange={(_, name: string) => (location.hash = name)}>
            {Object.entries(sections).map(([name, s]) => (
              <Tab key={name} value={name} label={s.title} />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Page />
      </Container>
    </>
  );
}
