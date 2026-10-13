import type { ISource, TSources } from './utils';

/** 上游可能缺少 `#EXTM3U` 头部，补上 */
export const joevess_iptv_transform: ISource['transform'] = ({ header, channels }, filename) => [
  { filename, playlist: { header: header ?? '#EXTM3U', channels } },
];

export const joevess_iptv_sources: TSources = [
  {
    name: 'joevess/IPTV home',
    f_name: 'j_home',
    url: 'https://raw.githubusercontent.com/joevess/IPTV/main/home.m3u8',
    transform: joevess_iptv_transform,
  },
  {
    name: 'joevess/IPTV iptv',
    f_name: 'j_iptv',
    url: 'https://raw.githubusercontent.com/joevess/IPTV/main/iptv.m3u8',
    transform: joevess_iptv_transform,
  },
];
