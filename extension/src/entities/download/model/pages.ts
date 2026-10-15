/**
 * Video and channel pages of known sites by address pattern (docs/extension/pages/site_page.md,
 * section 3): the "Download" banner shows on them by itself, without a request to the site.
 */

const VIDEO_PAGES: RegExp[] = [
  /^https?:\/\/(?:www\.|m\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/)[\w-]+/,
  /^https?:\/\/youtu\.be\/[\w-]+/,
  /^https?:\/\/(?:www\.)?pmvhaven\.com\/video\/[^/?#]+_[0-9a-f]{24}/,
  /^https?:\/\/(?:www\.)?tiktok\.com\/@[^/]+\/video\/\d+/,
  /^https?:\/\/(?:[a-z]+\.)?pornhub\.(?:com|org)\/view_video\.php\?(?:.*&)?viewkey=\w+/,
  /^https?:\/\/(?:www\.)?redgifs\.com\/watch\/\w+/,
  /^https?:\/\/(?:www\.)?spankbang\.com\/\w+\/video\//,
  /^https?:\/\/(?:www\.)?erome\.com\/a\/\w+/,
];

const CHANNEL_PAGES: RegExp[] = [
  /^https?:\/\/(?:www\.|m\.)?youtube\.com\/(?:@[^/?#]+|channel\/[\w-]+|c\/[^/?#]+)\/?(?:videos|shorts|streams|featured)?\/?(?:[?#].*)?$/,
  /^https?:\/\/(?:www\.)?pmvhaven\.com\/profile\/[^/?#]+\/?(?:[?#].*)?$/,
  /^https?:\/\/(?:www\.)?tiktok\.com\/@[^/?#]+\/?(?:[?#].*)?$/,
  /^https?:\/\/(?:www\.)?pornhub\.(?:com|org)\/(?:model|pornstar|channels|users)\/[^/?#]+(?:\/videos)?\/?(?:[?#].*)?$/,
  /^https?:\/\/(?:www\.)?redgifs\.com\/users\/[^/?#]+\/?(?:[?#].*)?$/,
  /^https?:\/\/(?:www\.)?spankbang\.com\/profile\/[^/?#]+(?:\/videos)?\/?(?:[?#].*)?$/,
];

export type PageKind = 'video' | 'channel';

/** Video or channel of a known site; `undefined` for any other page. */
export function pageKind(url: string): PageKind | undefined {
  if (VIDEO_PAGES.some((re) => re.test(url))) return 'video';
  if (CHANNEL_PAGES.some((re) => re.test(url))) return 'channel';
  return undefined;
}
