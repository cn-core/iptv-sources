import { dedupeChannels } from '../playlist';
import { cleanChannelMarks, toSimplified } from './utils';
import type { ISource, TSources } from './utils';

const TVG_NAME_REGEXP = /#EXTINF:-1\s+tvg-name="([^"]+)"/;

/** 只保留带 tvg-name 的频道，按 tvg-name 去重 */
export const epg_pw_transform: ISource['transform'] = ({ header, channels }, filename) => {
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

export const epg_pw_sources: TSources = [
  {
    name: 'epg.pw China',
    f_name: 'cn',
    url: 'https://epg.pw/test_channels_china.m3u',
    transform: epg_pw_transform,
  },
  // {
  //   name: 'epg.pw China National',
  //   f_name: 'cn_n',
  //   url: 'https://epg.pw/test_channels_china_national.m3u',
  //   transform: epg_pw_transform,
  // },
  // {
  //   name: 'epg.pw China Country',
  //   f_name: 'cn_c',
  //   url: 'https://epg.pw/test_channels_china_country.m3u',
  //   transform: epg_pw_transform,
  // },
  // {
  //   name: 'epg.pw China Province',
  //   f_name: 'cn_p',
  //   url: 'https://epg.pw/test_channels_china_province.m3u',
  //   transform: epg_pw_transform,
  // },
  {
    name: 'epg.pw All',
    f_name: 'all',
    url: 'https://epg.pw/test_channels_all.m3u',
    transform: epg_pw_transform,
    collectSources: false,
  },
];
