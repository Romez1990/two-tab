import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { statusBadge, type PageCheck } from '../model/page-status';

/**
 * Метка статуса страницы у вкладки; со страницей всё хорошо — ничего. Нажатие проверяет страницу заново.
 * Метка стоит внутри строки-ссылки, поэтому нажатие не доходит до ссылки.
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
