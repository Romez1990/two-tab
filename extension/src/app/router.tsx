import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type ComponentType } from 'react';
import { DownloadWindow } from '@/pages/download';
import { DownloadsPage } from '@/pages/downloads';
import { RecompressPage } from '@/pages/recompress';
import { AttentionBanner } from '@/features/queue-attention';
import { DuplicatesPage } from '@/pages/duplicates';
import { RecoveryPage } from '@/pages/recovery';
import { SavedPage } from '@/pages/saved';
import { SearchPage } from '@/pages/search';
import { SettingsPage } from '@/pages/settings';
import { WindowsPage } from '@/pages/windows';

/** Разделы главной страницы расширения по адресу после `#`. */
const sections: Record<string, { title: string; page: ComponentType; hidden?: boolean }> = {
  search: { title: 'Поиск', page: SearchPage },
  saved: { title: 'Сохранённые', page: SavedPage },
  duplicates: { title: 'Дубликаты', page: DuplicatesPage },
  downloads: { title: 'Скачивание', page: DownloadsPage },
  recompress: { title: 'Сжатие', page: RecompressPage },
  // Окно «Скачать»: открывается кнопкой на сайте или во всплывающем окне, адрес — после #download/.
  download: { title: 'Скачать', page: DownloadWindow, hidden: true },
  windows: { title: 'Окна', page: WindowsPage },
  recovery: { title: 'Восстановление', page: RecoveryPage },
  settings: { title: 'Настройки', page: SettingsPage },
};
const DEFAULT_SECTION = 'windows';

function currentSection(): string {
  const name = location.hash.slice(1).split(/[/?]/)[0] ?? '';
  return name in sections ? name : DEFAULT_SECTION;
}

export function AppRouter() {
  const [section, setSection] = useState(currentSection);
  useEffect(() => {
    const onHash = () => setSection(currentSection());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const Page = sections[section]?.page ?? WindowsPage;

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 4 }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Tabsurd
          </Typography>
          <Tabs value={sections[section]?.hidden ? false : section} onChange={(_, name: string) => (location.hash = name)}>
            {Object.entries(sections)
              .filter(([, s]) => !s.hidden)
              .map(([name, s]) => (
              <Tab key={name} value={name} label={s.title} />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* «Нужно ваше решение» — вверху каждой страницы (docs/extension/queues.md, раздел 4). */}
        <AttentionBanner onOpen={(name) => (location.hash = name)} />
        <Page />
      </Container>
    </>
  );
}
