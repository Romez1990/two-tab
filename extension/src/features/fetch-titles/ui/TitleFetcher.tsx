import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useRef, useState } from 'react';
import type { SavedItem } from '@/entities/saved';
import { fillTitles, hasSiteAccess, pendingTitleUrls, requestSiteAccess } from '../model/fetch-titles';

/**
 * Пока открыта страница «Сохранённые», загружает настоящие заголовки вкладкам без заголовка.
 * Без доступа к сайтам показывает кнопку, которая его спрашивает.
 */
export function TitleFetcher({
  items,
  onTitle,
}: {
  items: readonly SavedItem[];
  onTitle: (url: string, title: string) => void;
}) {
  const [access, setAccess] = useState<boolean | undefined>();
  const [pending, setPending] = useState<string[]>([]);
  const [checked, setChecked] = useState(0);
  const [found, setFound] = useState(0);
  const started = useRef(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onTitleRef = useRef(onTitle);
  onTitleRef.current = onTitle;

  useEffect(() => {
    void hasSiteAccess().then(setAccess);
  }, []);

  // Очередь считается один раз, когда записи загрузились: найденные заголовки меняют записи, но не очередь.
  useEffect(() => {
    if (started.current || items.length === 0) return;
    started.current = true;
    void pendingTitleUrls(items).then(setPending);
  }, [items]);

  useEffect(() => {
    if (!access || pending.length === 0) return;
    const controller = new AbortController();
    void fillTitles(
      pending,
      itemsRef.current,
      (url, title) => {
        if (title) {
          setFound((n) => n + 1);
          onTitleRef.current(url, title);
        }
        setChecked((n) => n + 1);
      },
      controller.signal,
    );
    return () => controller.abort();
  }, [access, pending]);

  if (pending.length === 0 || access === undefined || checked >= pending.length) return null;
  if (!access) {
    return (
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={() => void requestSiteAccess().then(setAccess)}>
            Разрешить
          </Button>
        }
      >
        У {pending.length} вкладок нет заголовка. Чтобы загрузить настоящие заголовки, расширению нужен доступ к сайтам.
      </Alert>
    );
  }
  return (
    <Alert severity="info" icon={false}>
      Загружаю заголовки: проверено {checked} из {pending.length}, найдено {found}.
      <LinearProgress variant="determinate" value={(checked / pending.length) * 100} sx={{ mt: 1 }} />
    </Alert>
  );
}
