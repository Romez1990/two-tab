import { describe, expect, it } from 'vitest';
import { pageKind } from './pages';

describe('pageKind', () => {
  it.each([
    'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    'https://www.youtube.com/watch?list=x&v=jNQXAC9IVRw',
    'https://www.youtube.com/shorts/abc_DEF-1',
    'https://pmvhaven.com/video/kream-tushyraw_6698d622f656d6a954f7c656',
    'https://www.tiktok.com/@npcprincess666/video/7301234567890123456',
    'https://www.pornhub.com/view_video.php?viewkey=ph5f1234',
    'https://www.redgifs.com/watch/somegif',
    'https://www.erome.com/a/AbC123',
  ])('video: %s', (url) => expect(pageKind(url)).toBe('video'));

  it.each([
    'https://www.youtube.com/@chan',
    'https://www.youtube.com/@chan/videos',
    'https://pmvhaven.com/profile/wombatpmv',
    'https://www.tiktok.com/@npcprincess666',
    'https://www.pornhub.com/model/someone/videos',
  ])('channel: %s', (url) => expect(pageKind(url)).toBe('channel'));

  it.each(['https://www.youtube.com/', 'https://www.youtube.com/results?search_query=x', 'https://mail.google.com/'])('other: %s', (url) =>
    expect(pageKind(url)).toBeUndefined(),
  );
});
