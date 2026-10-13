import { describe, expect, it } from 'vitest';
import { getContent } from '../../src/file';
import { collectSourceUrls } from '../../src/pipeline/sources';
import { toTxt } from '../../src/playlist';
import { buildSourceOutputs, sources } from '../../src/sources';
import { hotel_tvn_sources } from '../../src/sources/hotel_tvn';
import { youhun_sources } from '../../src/sources/youhun';
import { zbds_sources } from '../../src/sources/zbds';
describe('sources', () => {
  it('sources should be a non-empty array', () => {
    expect(Array.isArray(sources)).toBe(true);
    expect(sources.length).toBeGreaterThan(0);
  });

  it('each source should match ISource structure', () => {
    for (const sr of sources) {
      expect(sr).toHaveProperty('name');
      expect(sr).toHaveProperty('f_name');
      expect(sr).toHaveProperty('url');
    }
  });
});

describe('zbds_sources', () => {
  it('should contain ipv4 and ipv6 sources', () => {
    expect(zbds_sources).toHaveLength(2);
    const names = zbds_sources.map((s) => s.f_name);
    expect(names).toContain('zbds_ipv4');
    expect(names).toContain('zbds_ipv6');
  });

  it('url should point to m3u', () => {
    for (const s of zbds_sources) {
      expect(s.url).toMatch(/\.m3u$/);
    }
  });
});

describe('hotel_tvn_sources', () => {
  it('should contain hotel_tvn source', () => {
    expect(hotel_tvn_sources).toHaveLength(1);
    expect(hotel_tvn_sources[0].f_name).toBe('hotel_tvn');
  });
});

describe('youhun_sources', () => {
  it('should collect youhun live data and get m3u data structure', { timeout: 15000 }, async () => {
    const sr = youhun_sources[0];
    const [ok, text] = await getContent(sr);
    expect(ok).toBe(true);
    expect(text).toBeDefined();
    expect(typeof text).toBe('string');
    expect((text as string).length).toBeGreaterThan(0);

    const outputs = buildSourceOutputs(sr, text as string);
    const [result] = outputs;

    expect(result.filename).toBe(sr.f_name);
    expect(result.playlist.channels.length).toBeGreaterThan(0);
    expect(result.playlist.header?.startsWith('#EXTM3U')).toBe(true);

    const collected = collectSourceUrls(sr, outputs);
    expect(collected.size).toBeGreaterThan(0);
    for (const [, urls] of collected) {
      expect(Array.isArray(urls)).toBe(true);
      expect(urls.length).toBeGreaterThan(0);
      expect(urls.every((u) => typeof u === 'string' && u.length > 0)).toBe(true);
    }

    const txt = toTxt(result.playlist.channels);
    expect(typeof txt).toBe('string');
    expect(txt.length).toBeGreaterThan(0);
  });
});
