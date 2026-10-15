/** Channel and subscription filters in words (tidy-reel/docs/downloader.md, section 6.1). */
export function describeFilters(filters: Record<string, unknown>): string {
  const parts: string[] = [];
  const { date_from, date_to, number_from, number_to, from_end, min_duration, max_duration } = filters as {
    date_from?: string;
    date_to?: string;
    number_from?: number;
    number_to?: number;
    from_end?: boolean;
    min_duration?: number;
    max_duration?: number;
  };
  if (date_from || date_to) parts.push(`опубликованы ${date_from ? `с ${date_from}` : ''}${date_from && date_to ? ' ' : ''}${date_to ? `по ${date_to}` : ''}`);
  if (number_from || number_to)
    parts.push(`№ ${number_from ?? 1}–${number_to ?? '…'} ${from_end ? 'с конца' : 'с начала'}`);
  if (min_duration || max_duration)
    parts.push(`длительность ${min_duration ? `от ${Math.round(min_duration / 60)} мин` : ''}${min_duration && max_duration ? ' ' : ''}${max_duration ? `до ${Math.round(max_duration / 60)} мин` : ''}`);
  return parts.length ? parts.join(', ') : 'все видео';
}
