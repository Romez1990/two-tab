/**
 * "Smart search" (docs/extension/pages/search.md, section 2): the query is parsed into a condition tree
 * once. The extension checks tabs itself and sends the archive tree to the local service, in the same
 * format as `POST /api/archive/search` (tidy-reel/docs/local_service/local_service.md, section 7.2).
 */

export type Field = 'name' | 'path' | 'url' | 'title' | 'channel' | 'song' | 'group' | 'any';

/** Search sources (docs/extension/pages/search.md, section 1), the values of `source:`. */
export type SearchSource = 'open' | 'saved' | 'archive' | 'closed' | 'snapshot';

export const SEARCH_SOURCES: readonly SearchSource[] = ['open', 'saved', 'archive', 'closed', 'snapshot'];

export type Condition =
  | { op: 'term'; field: Field; text: string; phrase: boolean }
  | { op: 'source'; source: SearchSource }
  | { op: 'and'; items: Condition[] }
  | { op: 'or'; items: Condition[] }
  | { op: 'not'; item: Condition };

export class SearchSyntaxError extends Error {}

/** Prefix of a word or a bracketed group; `null` means no prefix. */
type Prefix = Field | 'source' | null;

const FIELDS: readonly Field[] = ['name', 'path', 'url', 'title', 'channel', 'song', 'group', 'any'];
const PREFIXES: readonly string[] = [...FIELDS, 'source'];

type Token =
  | { kind: 'close' | 'or' | 'not' }
  | { kind: 'open'; prefix: Prefix }
  | { kind: 'word'; text: string; phrase: boolean; prefix: Prefix };

/**
 * What is checked on a tab or file: `name` is the title or file name. A field the source does not
 * have is absent from the document too: a condition on it is false, and under NOT it is true (strict logic).
 */
export interface SearchDoc {
  source: SearchSource;
  name: string;
  path?: string;
  url?: string;
  title?: string;
  channel?: string;
  song?: string;
  group?: string;
}

const ANY_FIELDS = ['name', 'path', 'url', 'title', 'channel', 'song', 'group'] as const;

/**
 * Parses a query; an empty query gives `null`. A syntax error throws `SearchSyntaxError`.
 * A prefix before brackets applies to the group words without their own prefix: `any:(a | path:b)`.
 */
export function parseQuery(query: string): Condition | null {
  const tokens = tokenize(query);
  if (tokens.length === 0) return null;
  let pos = 0;
  const peek = () => tokens[pos];

  function or(context: Prefix): Condition {
    const items = [and(context)];
    while (peek()?.kind === 'or') {
      pos++;
      items.push(and(context));
    }
    return items.length === 1 ? items[0]! : { op: 'or', items };
  }
  function and(context: Prefix): Condition {
    const items: Condition[] = [];
    while (pos < tokens.length && peek()!.kind !== 'or' && peek()!.kind !== 'close') items.push(unary(context));
    if (items.length === 0) throw new SearchSyntaxError('Пустое условие: проверьте «|» и скобки');
    return items.length === 1 ? items[0]! : { op: 'and', items };
  }
  function unary(context: Prefix): Condition {
    const token = peek();
    if (token?.kind === 'not') {
      pos++;
      if (pos >= tokens.length) throw new SearchSyntaxError('После «-» нет слова');
      return { op: 'not', item: unary(context) };
    }
    return primary(context);
  }
  function primary(context: Prefix): Condition {
    const token = tokens[pos++];
    if (!token) throw new SearchSyntaxError('Запрос оборвался');
    if (token.kind === 'open') {
      const inner = or(token.prefix ?? context);
      if (tokens[pos++]?.kind !== 'close') throw new SearchSyntaxError('Нет закрывающей скобки');
      return inner;
    }
    if (token.kind === 'word') return word(token.text, token.phrase, token.prefix ?? context);
    throw new SearchSyntaxError(token.kind === 'close' ? 'Лишняя закрывающая скобка' : 'Неожиданный «|»');
  }

  const tree = or(null);
  if (pos < tokens.length) throw new SearchSyntaxError('Лишняя закрывающая скобка');
  return tree;
}

function tokenize(query: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < query.length) {
    const c = query[i]!;
    if (/\s/.test(c)) {
      i++;
    } else if (c === '(') {
      tokens.push({ kind: 'open', prefix: null });
      i++;
    } else if (c === ')' || c === '|') {
      tokens.push({ kind: c === ')' ? 'close' : 'or' });
      i++;
    } else if (c === '-' && (tokens.length === 0 || /[\s(|]/.test(query[i - 1] ?? ' '))) {
      tokens.push({ kind: 'not' });
      i++;
    } else {
      const { prefix, length } = readPrefix(query, i);
      i += length;
      if (prefix && query[i] === '(') {
        tokens.push({ kind: 'open', prefix });
        i++;
      } else if (query[i] === '"') {
        const end = query.indexOf('"', i + 1);
        if (end < 0) throw new SearchSyntaxError('Нет закрывающей кавычки');
        const text = query.slice(i + 1, end).trim();
        if (text) tokens.push({ kind: 'word', text, phrase: true, prefix });
        i = end + 1;
      } else {
        const start = i;
        while (i < query.length && !/[\s()|]/.test(query[i]!)) i++;
        const text = query.slice(start, i);
        if (!text) throw new SearchSyntaxError(`После «${prefix}:» нет слова`);
        tokens.push({ kind: 'word', text, phrase: false, prefix });
      }
    }
  }
  return tokens;
}

function readPrefix(query: string, i: number): { prefix: Prefix; length: number } {
  const match = /^([^\s()|":-][^\s()|":]*):/.exec(query.slice(i));
  if (!match) return { prefix: null, length: 0 };
  const name = match[1]!.toLowerCase();
  if (!PREFIXES.includes(name)) {
    throw new SearchSyntaxError(
      `Неизвестный префикс «${match[0]}». Есть: ${PREFIXES.map((p) => `${p}:`).join(', ')}. Двоеточие в тексте — в кавычках: "12:30"`,
    );
  }
  return { prefix: name as Prefix, length: match[0].length };
}

function word(text: string, phrase: boolean, prefix: Prefix): Condition {
  if (prefix !== 'source') return { op: 'term', field: prefix ?? 'name', text, phrase };
  const source = text.toLowerCase();
  if (!SEARCH_SOURCES.includes(source as SearchSource)) {
    throw new SearchSyntaxError(`Неизвестный источник «source:${text}». Есть: ${SEARCH_SOURCES.join(', ')}`);
  }
  return { op: 'source', source: source as SearchSource };
}

export function matches(condition: Condition, doc: SearchDoc): boolean {
  switch (condition.op) {
    case 'term':
      return condition.field === 'any'
        ? ANY_FIELDS.some((field) => contains(doc[field], condition.text))
        : contains(doc[condition.field], condition.text);
    case 'source':
      return doc.source === condition.source;
    case 'and':
      return condition.items.every((item) => matches(item, doc));
    case 'or':
      return condition.items.some((item) => matches(item, doc));
    case 'not':
      return !matches(condition.item, doc);
  }
}

export function contains(text: string | undefined, word: string): boolean {
  return !!text && normalize(text).includes(normalize(word));
}

/** Case and `ё` do not matter. */
export function normalize(text: string): string {
  return text.toLowerCase().replaceAll('ё', 'е');
}

/** Sources the query mentions in `source:` (for the hint about disabled ones). */
export function mentionedSources(condition: Condition): SearchSource[] {
  switch (condition.op) {
    case 'term':
      return [];
    case 'source':
      return [condition.source];
    case 'and':
    case 'or':
      return [...new Set(condition.items.flatMap(mentionedSources))];
    case 'not':
      return mentionedSources(condition.item);
  }
}

/** "By relevance" rank, as in the service: phrase in the name, word in the name, name starts with the word. */
export function relevance(condition: Condition, doc: { name: string }): number {
  const names = positiveTerms(condition).filter((t) => t.field === 'name' || t.field === 'any');
  const name = normalize(doc.name);
  const phrase = names.some((t) => t.phrase && contains(doc.name, t.text));
  const inName = names.some((t) => contains(doc.name, t.text));
  const starts = names.some((t) => name.startsWith(normalize(t.text)));
  return (phrase ? 4 : 0) + (inName ? 2 : 0) + (starts ? 1 : 0);
}

/** Words that must be in the result (not under NOT). */
export function positiveTerms(condition: Condition, negated = false): Extract<Condition, { op: 'term' }>[] {
  switch (condition.op) {
    case 'term':
      return negated ? [] : [condition];
    case 'source':
      return [];
    case 'and':
    case 'or':
      return condition.items.flatMap((item) => positiveTerms(item, negated));
    case 'not':
      return positiveTerms(condition.item, !negated);
  }
}
