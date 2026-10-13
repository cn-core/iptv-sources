import { describe, expect, it } from 'vitest';

import { parseTxt } from '../../src/playlist';
import { buildSourceOutputs, cleanChannelMarks, type ISource } from '../../src/sources/utils';

const m3u = ['#EXTM3U', '#EXTINF:-1,Channel A', 'https://a.com'].join('\n');

describe('buildSourceOutputs', () => {
  it('parses m3u and emits one output named filename by default', () => {
    const source: ISource = { name: 'test', filename: 'test_m3u', url: '' };

    expect(buildSourceOutputs(source, m3u)).toEqual([
      {
        filename: 'test_m3u',
        playlist: {
          header: '#EXTM3U',
          channels: [{ extinf: '#EXTINF:-1,Channel A', url: 'https://a.com' }],
        },
      },
    ]);
  });

  it('uses the source parser and transform', () => {
    const source: ISource = {
      name: 'test',
      filename: 'test_txt',
      url: '',
      parse: parseTxt,
      transform: (playlist, filename) => [
        { filename: `${filename}_a`, playlist },
        { filename: `${filename}_b`, playlist },
      ],
    };
    const outputs = buildSourceOutputs(source, '央视,#genre#\nCCTV1,https://cctv1.com');

    expect(outputs.map(({ filename }) => filename)).toEqual(['test_txt_a', 'test_txt_b']);
    expect(outputs[0].playlist.channels[0].extinf).toContain(
      'tvg-logo="https://tv-res.pages.dev/logo/cctv1.png"'
    );
  });
});

describe('cleanChannelMarks', () => {
  it('removes @@ ids and geo-blocked marks', () => {
    expect(
      cleanChannelMarks({ extinf: '#EXTINF:-1,CCTV1@@123 [Geo-blocked] ', url: 'http://a' })
    ).toEqual({ extinf: '#EXTINF:-1,CCTV1', url: 'http://a' });
  });
});
