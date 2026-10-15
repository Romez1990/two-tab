import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Pagination of long lists, one component for all pages (docs/extension/specification.md, section 2):
 * by pages or while scrolling; the choice is remembered in this browser for each list.
 */

/** Records per page and how many are added at a time while scrolling. */
export const PAGE_SIZE = 50;

type Mode = 'pages' | 'scroll';

/** Ellipsis in the page switcher: a click turns it into a field, a page number and Enter navigate. */
function PageJump({ pages, onJump }: { pages: number; onJump: (page: number) => void }) {
  const [editing, setEditing] = useState(false);
  if (!editing) {
    return (
      <Tooltip title="Перейти к странице">
        <Button size="small" onClick={() => setEditing(true)} sx={{ minWidth: 26, height: 26, px: 0.5, color: 'text.primary' }}>
          …
        </Button>
      </Tooltip>
    );
  }
  return (
    <TextField
      autoFocus
      size="small"
      placeholder={`1–${pages}`}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setEditing(false);
        if (e.key !== 'Enter') return;
        const page = Number((e.target as HTMLInputElement).value);
        if (Number.isInteger(page) && page >= 1 && page <= pages) onJump(page);
        setEditing(false);
      }}
      slotProps={{ htmlInput: { inputMode: 'numeric', 'aria-label': 'Номер страницы', style: { textAlign: 'center' } } }}
      sx={{ width: 64, mx: 0.5, '& input': { py: 0.25 } }}
    />
  );
}

function readMode(key: string): Mode {
  try {
    return localStorage.getItem(key) === 'scroll' ? 'scroll' : 'pages';
  } catch {
    return 'pages';
  }
}

export interface PagingOptions {
  /** localStorage key under which the mode of this list is remembered. */
  storageKey: string;
  /** A change of this value returns to the first page: for example a new search query. */
  resetKey?: unknown;
  /** Record that must be on screen (index in the list), or -1. */
  focusIndex?: number;
  pageSize?: number;
  /** Page number from outside (for example in the page address): then navigation is reported to `onPageChange`. */
  page?: number;
  onPageChange?: (page: number) => void;
}

/** Visible part of the list and the footer: an invisible scroll marker and a panel stuck to the window bottom. */
export function usePaging<T>(items: readonly T[], options: PagingOptions): { visible: T[]; footer: ReactNode } {
  const { storageKey, resetKey, focusIndex = -1, pageSize = PAGE_SIZE, onPageChange } = options;
  const [mode, setMode] = useState<Mode>(() => readMode(storageKey));
  const [limit, setLimit] = useState(pageSize);
  const [ownPage, setOwnPage] = useState(1);
  const page = options.page ?? ownPage;
  const setPage = onPageChange ?? setOwnPage;
  useEffect(() => {
    setLimit(pageSize);
    if (options.page === undefined) setOwnPage(1);
  }, [resetKey, pageSize]);
  useEffect(() => {
    if (focusIndex >= 0) setPage(Math.floor(focusIndex / pageSize) + 1);
  }, [focusIndex, pageSize]);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pages);
  const visible =
    mode === 'pages'
      ? items.slice((current - 1) * pageSize, current * pageSize)
      : items.slice(0, Math.max(limit, focusIndex + 1));
  const more = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = more.current;
    if (mode !== 'scroll' || !el) return;
    const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setLimit((n) => n + pageSize), {
      rootMargin: '800px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode, visible.length, items.length, pageSize]);

  const changeMode = (next: Mode) => {
    setMode(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // Without storage the choice lasts until the page closes.
    }
  };
  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  const footer = (
    <>
      {/* Invisible end-of-list marker: when it gets close to the screen, the next portion loads. */}
      {mode === 'scroll' && visible.length < items.length && <Box ref={more} sx={{ height: 1 }} />}
      {items.length > pageSize && (
        // The thin panel always sticks to the window bottom: pages and mode switch without scrolling to the end of the list.
        <Stack
          direction="row"
          spacing={2}
          sx={{
            py: 0.5,
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            rowGap: 0.5,
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          {mode === 'pages' ? (
            <Pagination
              count={pages}
              page={current}
              onChange={(_, p) => goTo(p)}
              color="primary"
              size="small"
              renderItem={(it) =>
                it.type === 'start-ellipsis' || it.type === 'end-ellipsis' ? <PageJump pages={pages} onJump={goTo} /> : <PaginationItem {...it} />
              }
            />
          ) : (
            <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Показано {visible.length} из {items.length}
            </Box>
          )}
          <Button size="small" variant="outlined" onClick={() => changeMode(mode === 'pages' ? 'scroll' : 'pages')}>
            {mode === 'pages' ? 'Листать прокруткой' : 'По страницам'}
          </Button>
        </Stack>
      )}
    </>
  );
  return { visible, footer };
}
