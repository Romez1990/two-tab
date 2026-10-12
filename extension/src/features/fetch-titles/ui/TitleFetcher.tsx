import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useRef, useState } from 'react';
import type { SavedItem } from '@/entities/saved';
import { fillTitles, pendingTitleUrls } from '../model/fetch-titles';

/**
 * Пока открыта страница «Сохранённые», загружает настоящие заголовки вкладкам без заголовка.
 * Доступ к сайтам спрашивает страница; без него только сообщает, сколько вкладок ждут заголовка (`onPending`).
 */
export function TitleFetcher({
  items,
  access,
  onTitle,
  onPending,
}: {
  items: readonly SavedItem[];
  access: boolean | undefined;
  onTitle: (url: string, title: string) => void;
  onPending: (count: number) => void;
}) {
  const [pending, setPending] = useState<string[]>([]);
  const [checked, setChecked] = useState(0);
  const [found, setFound] = useState(0);
  const started = useRef(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onTitleRef = useRef(onTitle);
  onTitleRef.current = onTitle;

  // Очередь считается один раз, когда записи загрузились: найденные заголовки меняют записи, но не очередь.
  useEffect(() => {
    if (started.current || items.length === 0) return;
    started.current = true;
    void pendingTitleUrls(items).then(setPending);
  }, [items]);

  useEffect(() => onPending(Math.max(0, pending.length - checked)), [pending, checked, onPending]);

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

  if (!access || pending.length === 0 || checked >= pending.length) return null;
  return (
    <Alert severity="info" icon={false}>
      Загружаю заголовки: проверено {checked} из {pending.length}, найдено {found}.
      <LinearProgress variant="determinate" value={(checked / pending.length) * 100} sx={{ mt: 1 }} />
    </Alert>
  );
}
