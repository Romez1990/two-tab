/**
 * «Умный поиск» (docs/extension/pages/search.md, раздел 2): запрос разбирается в дерево условий один
 * раз. Вкладки расширение проверяет само, а дерево архива отправляет локальному сервису — формат тот
 * же, что у `POST /api/archive/search` (tidy-reel/docs/local_service/local_service.md, раздел 7.2).
 */

export type Field = 'name' | 'path' | 'url';

export type Condition =
  | { op: 'term'; field: Field; text: string; phrase: boolean }
  | { op: 'and'; items: Condition[] }
  | { op: 'or'; items: Condition[] }
  | { op: 'not'; item: Condition };

export class SearchSyntaxError extends Error {}

type Token =
  | { kind: 'open' | 'close' | 'or' | 'not' }
  | { kind: 'word'; text: string; phrase: boolean; field: Field };

const PREFIXES: Record<string, Field> = { 'path:': 'path', 'url:': 'url' };

function tokenize(query: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < query.length) {
    const c = query[i]!;
    if (/\s/.test(c)) {
      i++;
    } else if (c === '(' || c === ')' || c === '|') {
      tokens.push({ kind: c === '(' ? 'open' : c === ')' ? 'close' : 'or' });
      i++;
    } else if (c === '-' && (tokens.length === 0 || /[\s(|]/.test(query[i - 1] ?? ' '))) {
      tokens.push({ kind: 'not' });
      i++;
    } else {
      let field: Field = 'name';
      const rest = query.slice(i).toLowerCase();
      const prefix = Object.keys(PREFIXES).find((p) => rest.startsWith(p));
      if (prefix) {
        field = PREFIXES[prefix]!;
        i += prefix.length;
      }
      if (query[i] === '"') {
        const end = query.indexOf('"', i + 1);
        if (end < 0) throw new SearchSyntaxError('Нет закрывающей кавычки');
        const text = query.slice(i + 1, end).trim();
        if (text) tokens.push({ kind: 'word', text, phrase: true, field });
        i = end + 1;
      } else {
        const start = i;
        while (i < query.length && !/[\s()|]/.test(query[i]!)) i++;
        const text = query.slice(start, i);
        if (!text) throw new SearchSyntaxError(`После «${prefix}» нет слова`);
        tokens.push({ kind: 'word', text, phrase: false, field });
      }
    }
  }
  return tokens;
}

/** Разбирает запрос; пустой запрос — `null`. Ошибка синтаксиса — `SearchSyntaxError`. */
export function parseQuery(query: string): Condition | null {
  const tokens = tokenize(query);
  if (tokens.length === 0) return null;
  let pos = 0;
  const peek = () => tokens[pos];

  function or(): Condition {
    const items = [and()];
    while (peek()?.kind === 'or') {
      pos++;
      items.push(and());
    }
    return items.length === 1 ? items[0]! : { op: 'or', items };
  }
  function and(): Condition {
    const items: Condition[] = [];
    while (pos < tokens.length && peek()!.kind !== 'or' && peek()!.kind !== 'close') items.push(unary());
    if (items.length === 0) throw new SearchSyntaxError('Пустое условие: проверьте «|» и скобки');
    return items.length === 1 ? items[0]! : { op: 'and', items };
  }
  function unary(): Condition {
    const token = peek();
    if (token?.kind === 'not') {
      pos++;
      if (pos >= tokens.length) throw new SearchSyntaxError('После «-» нет слова');
      return { op: 'not', item: unary() };
    }
    return primary();
  }
  function primary(): Condition {
    const token = tokens[pos++];
    if (!token) throw new SearchSyntaxError('Запрос оборвался');
    if (token.kind === 'open') {
      const inner = or();
      if (tokens[pos++]?.kind !== 'close') throw new SearchSyntaxError('Нет закрывающей скобки');
      return inner;
    }
    if (token.kind === 'word') return { op: 'term', field: token.field, text: token.text, phrase: token.phrase };
    throw new SearchSyntaxError(token.kind === 'close' ? 'Лишняя закрывающая скобка' : 'Неожиданный «|»');
  }

  const tree = or();
  if (pos < tokens.length) throw new SearchSyntaxError('Лишняя закрывающая скобка');
  return tree;
}

const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`";
const RU = 'йцукенгшщзхъфывапролджэячсмитьбюё';

/** Регистр и `ё` не важны. */
export function normalize(text: string): string {
  return text.toLowerCase().replaceAll('ё', 'е');
}

/** Те же клавиши в другой раскладке: `ьфкшф` → `maria`. */
export function otherLayout(text: string): string {
  let out = '';
  for (const c of text.toLowerCase()) {
    const en = EN.indexOf(c);
    const ru = RU.indexOf(c);
    out += en >= 0 ? RU[en] : ru >= 0 ? EN[ru] : c;
  }
  return normalize(out);
}

/** Что проверяется у вкладки или файла: `name` — заголовок или имя файла. */
export interface SearchDoc {
  name: string;
  path?: string;
  url?: string;
}

export function contains(text: string | undefined, word: string): boolean {
  if (!text) return false;
  const t = normalize(text);
  return t.includes(normalize(word)) || t.includes(otherLayout(word));
}

export function matches(condition: Condition, doc: SearchDoc): boolean {
  switch (condition.op) {
    case 'term':
      return contains(doc[condition.field], condition.text);
    case 'and':
      return condition.items.every((item) => matches(item, doc));
    case 'or':
      return condition.items.some((item) => matches(item, doc));
    case 'not':
      return !matches(condition.item, doc);
  }
}

/** Слова, которые должны быть в найденном (не под НЕ). */
export function positiveTerms(condition: Condition, negated = false): Extract<Condition, { op: 'term' }>[] {
  switch (condition.op) {
    case 'term':
      return negated ? [] : [condition];
    case 'and':
    case 'or':
      return condition.items.flatMap((item) => positiveTerms(item, negated));
    case 'not':
      return positiveTerms(condition.item, !negated);
  }
}

/** Ранг «по совпадению», как у сервиса: фраза в названии, слово в названии, название начинается со слова. */
export function relevance(condition: Condition, doc: SearchDoc): number {
  const names = positiveTerms(condition).filter((t) => t.field === 'name');
  const name = normalize(doc.name);
  const phrase = names.some((t) => t.phrase && contains(doc.name, t.text));
  const inName = names.some((t) => contains(doc.name, t.text));
  const starts = names.some((t) => name.startsWith(normalize(t.text)) || name.startsWith(otherLayout(t.text)));
  return (phrase ? 4 : 0) + (inName ? 2 : 0) + (starts ? 1 : 0);
}
