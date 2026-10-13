import { parseTxt } from '../playlist';
import type { TSources } from './utils';

export const youhun_sources: TSources = [
  {
    name: 'youhunwl/TVAPP',
    f_name: 'youhun',
    url: 'https://www.iyouhun.com/tv/zb',
    parse: parseTxt,
  },
];
