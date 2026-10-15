import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { statusBadge, type PageCheck } from '../model/page-status';

/**
 * Page status badge on a tab; nothing when the page is fine. A click checks the page again.
 * The badge sits inside the link row, so the click does not reach the link.
 */
export function PageStatus({ check, onRecheck }: { check: PageCheck | undefined; onRecheck: () => void }) {
  const [busy, setBusy] = useState<number>();
  const badge = statusBadge(check);
  if (!badge) return null;
  const checking = busy !== undefined && busy === check?.at;
  return (
    <Tooltip title={checking ? 'Проверяю…' : `${badge.hint} Нажмите, чтобы проверить снова.`}>
      <Chip
        size="small"
        label={badge.label}
        color={badge.color}
        variant={checking ? 'outlined' : 'filled'}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setBusy(check?.at);
          onRecheck();
        }}
        sx={{ height: 18, fontSize: '0.7rem', mr: 1, flexShrink: 0, '& .MuiChip-label': { px: 0.75 } }}
      />
    </Tooltip>
  );
}
