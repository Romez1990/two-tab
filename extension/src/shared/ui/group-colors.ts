/** Chrome называет цвета групп словами; здесь — близкие цвета для меток. */
export const GROUP_COLORS: Record<string, string> = {
  grey: '#5f6368',
  blue: '#1a73e8',
  red: '#d93025',
  yellow: '#f9ab00',
  green: '#188038',
  pink: '#d01884',
  purple: '#a142f4',
  cyan: '#007b83',
  orange: '#fa903e',
};

export function groupColor(color: string): string {
  return GROUP_COLORS[color] ?? GROUP_COLORS.grey!;
}
