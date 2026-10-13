import { dedupeChannels } from '../playlist';
import { get_channel_id, is_filted_channels } from '../utils';
import { cleanChannelMarks, toSimplified } from './utils';
import type { ISource, TSources } from './utils';

/** 过滤屏蔽频道，按频道 id 去重 */
export const iptv_org_transform: ISource['transform'] = ({ header, channels }, filename) => {
  const candidates = channels.filter(
    ({ extinf }) => !is_filted_channels(get_channel_id(extinf).trim())
  );
  const deduped = dedupeChannels(candidates, ({ extinf }) => get_channel_id(extinf));

  return [
    {
      filename,
      playlist: toSimplified({ header, channels: deduped.map(cleanChannelMarks) }),
      candidates,
    },
  ];
};

export const iptv_org_sources: TSources = [
  {
    name: 'iptv.org All',
    f_name: 'o_all',
    url: 'https://raw.githubusercontent.com/iptv-org/iptv/gh-pages/index.m3u',
    transform: iptv_org_transform,
    collectSources: false,
  },
  {
    name: 'iptv.org China',
    f_name: 'o_cn',
    url: 'https://raw.githubusercontent.com/iptv-org/iptv/gh-pages/countries/cn.m3u',
    transform: iptv_org_transform,
  },
];

export const iptv_org_stream_sources: TSources = [
  {
    name: 'iptv.org stream China',
    f_name: 'o_s_cn',
    url: 'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn.m3u',
    transform: iptv_org_transform,
  },
  {
    name: 'iptv.org stream China 112114',
    f_name: 'o_s_cn_112114',
    url: 'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_112114.m3u',
    transform: iptv_org_transform,
  },
  {
    name: 'iptv.org stream China CCTV',
    f_name: 'o_s_cn_cctv',
    url: 'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_cctv.m3u',
    transform: iptv_org_transform,
  },
  {
    name: 'iptv.org stream China CGTN',
    f_name: 'o_s_cn_cgtn',
    url: 'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_cgtn.m3u',
    transform: iptv_org_transform,
  },
];
