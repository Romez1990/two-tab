import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { formatDateTime } from '@/shared/lib';
import { groupColor } from '@/shared/ui';
import type { SavedMatch } from '../model/match-url';

/**
 * "Already saved": which saved windows and groups contain this page, with a link to each record.
 * The same block is used in the banner on a site and in the popup. No tooltips: on a site
 * the block lives in a shadow DOM, while tooltips render into `document.body`.
 */
export function SavedMatches({
  matches,
  onOpen,
  onClose,
}: {
  matches: readonly SavedMatch[];
  onOpen: (id: string) => void;
  onClose?: () => void;
}) {
  if (matches.length === 0) return null;
  return (
    <Alert
      severity="info"
      icon={<BookmarkOutlinedIcon fontSize="inherit" />}
      action={
        onClose && (
          <IconButton size="small" color="inherit" aria-label="Закрыть" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )
      }
    >
      <AlertTitle>Уже сохранено</AlertTitle>
      <Stack spacing={0.5}>
        {matches.map((m) => (
          <Stack key={m.id} direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
            {m.color && (
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, bgcolor: groupColor(m.color) }} />
            )}
            <Link
              component="button"
              underline="hover"
              onClick={() => onOpen(m.id)}
              sx={{
                textAlign: 'left',
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {m.title || 'Без названия'}
            </Link>
            <Box component="span" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
              {m.kind === 'window' ? 'окно' : 'группа'} · {m.tabs} · {formatDateTime(m.savedAt)}
            </Box>
          </Stack>
        ))}
      </Stack>
    </Alert>
  );
}
