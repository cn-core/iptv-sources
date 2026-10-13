import { dedupeChannels } from '../playlist';
import { cleanChannelMarks, toSimplified } from './utils';
import type { ISource, TSources } from './utils';

const TVG_NAME_REGEXP = /#EXTINF:-1\s+tvg-name="([^"]+)"/;

/** 只保留带 tvg-name 的频道，按 tvg-name 去重 */
export const epgPwTransform: ISource['transform'] = ({ header, channels }, filename) => {
  const candidates = channels.filter(({ extinf }) => TVG_NAME_REGEXP.test(extinf));
  const deduped = dedupeChannels(candidates, ({ extinf }) => TVG_NAME_REGEXP.exec(extinf)![1]);

  return [
    {
      filename,
      playlist: toSimplified({ header, channels: deduped.map(cleanChannelMarks) }),
      candidates,
    },
  ];
};

export const epgPwSources: TSources = [
  {
    name: 'epg.pw China',
    filename: 'cn',
    url: 'https://epg.pw/test_channels_china.m3u',
    transform: epgPwTransform,
  },
  // {
  //   name: 'epg.pw China National',
  //   filename: 'cn_n',
  //   url: 'https://epg.pw/test_channels_china_national.m3u',
  //   transform: epgPwTransform,
  // },
  // {
  //   name: 'epg.pw China Country',
  //   filename: 'cn_c',
  //   url: 'https://epg.pw/test_channels_china_country.m3u',
  //   transform: epgPwTransform,
  // },
  // {
  //   name: 'epg.pw China Province',
  //   filename: 'cn_p',
  //   url: 'https://epg.pw/test_channels_china_province.m3u',
  //   transform: epgPwTransform,
  // },
  {
    name: 'epg.pw All',
    filename: 'all',
    url: 'https://epg.pw/test_channels_all.m3u',
    transform: epgPwTransform,
    collectSources: false,
  },
];
