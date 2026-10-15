import HelpOutline from '@mui/icons-material/HelpOutlineOutlined';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

/**
 * Hint of a "smart" field (docs/extension/specification.md, section 2): a question mark next to the field,
 * on hover a table of all input options.
 */
export function SmartHint({ rows }: { rows: readonly (readonly [example: string, meaning: string])[] }) {
  const table = (
    <Box component="table" sx={{ borderCollapse: 'collapse', '& td': { py: 0.25, pr: 2, verticalAlign: 'top' } }}>
      <tbody>
        {rows.map(([example, meaning]) => (
          <tr key={example}>
            <td>
              <Box component="code" sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {example}
              </Box>
            </td>
            <td>{meaning}</td>
          </tr>
        ))}
      </tbody>
    </Box>
  );
  return (
    <Tooltip title={table} placement="bottom-start" slotProps={{ tooltip: { sx: { maxWidth: 520, fontSize: '0.8125rem' } } }}>
      <HelpOutline fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} aria-label="Подсказка" />
    </Tooltip>
  );
}

/** "Smart search" options (docs/extension/pages/search.md, section 2). */
export const SMART_SEARCH_HINT = [
  ['rain dance', 'оба слова, в любом порядке'],
  ['rain | snow', 'любое из слов'],
  ['rain -remix', 'rain, но без remix'],
  ['"rain dance"', 'точная фраза'],
  ['(rain | snow) dance', 'группировка скобками'],
  ['path:Indigo', 'слово в пути к папке от корня архива'],
  ['url:tiktok', 'слово в адресе'],
  ['title: channel: song:', 'название и канал на сайте, найденная песня (архив)'],
  ['group:', 'название группы (сохранённые вкладки)'],
  ['name:', 'в названии — как слово без префикса'],
  ['any:cat', 'где угодно: во всех полях сразу'],
  ['any:(cat | kitty)', 'префикс перед скобками — на всю группу'],
  ['source:archive', 'источник: open, saved, archive, closed, snapshot'],
  ['-channel:x source:archive', 'у вкладок канала нет — без source: они тоже найдутся'],
  ['"12:30"', 'двоеточие в тексте — в кавычках'],
] as const;

/** "Smart time point" options (tidy-reel/docs/recompress.md, section 2.7). */
export const SMART_TIME_HINT = [
  ['94f', 'начало: отрезать первые 94 кадра'],
  ['12.5, 0:12.5, 1:02:03.25', 'начало: начать с этого момента'],
  ['-94f', 'конец: отрезать последние 94 кадра'],
  ['-10.25, -0:10.25', 'конец: отрезать последние 10,25 с'],
  ['3:40.5', 'конец: закончить на этом моменте'],
] as const;
