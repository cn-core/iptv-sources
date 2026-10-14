import { describe, expect, it } from 'vitest';

import {
  buildChannelExtinf,
  getChannelAttr,
  getChannelLogoUrl,
  getChannelName,
  parseExtinf,
} from '../../src/playlist/extinf';

describe('parseExtinf', () => {
  it('parses duration, attributes and name', () => {
    expect(parseExtinf('#EXTINF:-1 tvg-id="CCTV1" group-title="央视",CCTV-1 综合')).toEqual({
      duration: '-1',
      attrs: { 'tvg-id': 'CCTV1', 'group-title': '央视' },
      name: 'CCTV-1 综合',
    });
  });

  it('splits the name at the first comma and keeps it untrimmed', () => {
    expect(parseExtinf('#EXTINF:-1, A, B ')?.name).toBe(' A, B ');
  });

  it('ignores commas inside quoted attribute values', () => {
    expect(parseExtinf('#EXTINF:-1 tvg-name="La Red, Chile" group-title="E",red uno')).toEqual({
      duration: '-1',
      attrs: { 'tvg-name': 'La Red, Chile', 'group-title': 'E' },
      name: 'red uno',
    });
  });

  it('falls back to the first comma when quotes are unbalanced', () => {
    expect(parseExtinf('#EXTINF:-1 tvg-name="A,B')?.name).toBe('B');
  });

  it('keeps the first value of duplicated attributes', () => {
    expect(parseExtinf('#EXTINF:-1 a="1" a="2",x')?.attrs).toEqual({ a: '1' });
  });

  it('accepts other durations and rejects non EXTINF lines', () => {
    expect(parseExtinf('#EXTINF:10.5,clip')?.duration).toBe('10.5');
    expect(parseExtinf('##EXTINF:-1,x')).toBeUndefined();
    expect(parseExtinf('#EXTINF:-1 no comma')).toBeUndefined();
  });
});

describe('buildChannelExtinf', () => {
  it('builds a line that parses back to the same fields', () => {
    expect(parseExtinf(buildChannelExtinf('A', { group: 'G', logo: 'http://l/a.png' }))).toEqual({
      duration: '-1',
      attrs: { 'tvg-id': 'A', 'tvg-name': 'A', 'tvg-logo': 'http://l/a.png', 'group-title': 'G' },
      name: 'A',
    });
  });

  it('fills tvg-id, tvg-name, tvg-logo and group-title', () => {
    expect(buildChannelExtinf('CCTV1', { group: '央视' })).toBe(
      '#EXTINF:-1 tvg-id="CCTV1" tvg-name="CCTV1" tvg-logo="https://tv-res.pages.dev/logo/cctv1.png" group-title="央视",CCTV1'
    );
  });

  it('accepts a custom logo', () => {
    expect(buildChannelExtinf('A', { group: 'G', logo: 'http://logo/a.png' })).toContain(
      'tvg-logo="http://logo/a.png"'
    );
  });
});

describe('channel helpers', () => {
  it('reads name and attributes from a line', () => {
    const line = '#EXTINF:-1 tvg-name="A" group-title="G",Name';
    expect(getChannelName(line)).toBe('Name');
    expect(getChannelAttr(line, 'group-title')).toBe('G');
    expect(getChannelAttr(line, 'tvg-logo')).toBeUndefined();
    expect(getChannelName('not extinf')).toBe('');
  });

  it('lowercases CCTV in logo urls', () => {
    expect(getChannelLogoUrl('CCTV5+')).toBe('https://tv-res.pages.dev/logo/cctv5+.png');
  });

  it('encodes unsafe characters in logo urls but keeps Chinese', () => {
    expect(getChannelLogoUrl('凤凰 中文#1/HD?')).toBe(
      'https://tv-res.pages.dev/logo/凤凰%20中文%231%2FHD%3F.png'
    );
  });
});
