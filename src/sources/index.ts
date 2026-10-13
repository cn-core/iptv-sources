import { china_iptv_sources } from './china_iptv';
// import { cymz6_lives_sources } from './cymz6_lives';
import { epg_pw_sources } from './epg_pw';
// import { fanmingming_live_sources } from './fanmingming_live';
import { hotel_tvn_sources } from './hotel_tvn';
// import { iptv_org_sources, iptv_org_stream_sources } from './iptv_org';
// import { joevess_iptv_sources } from './joevess_iptv';
import { qwerttvv_bj_iptv_sources } from './qwerttvv_bj_iptv';
// import { yang_m3u_sources } from './yang_m3u';
import { youhun_sources } from './youhun';
// import { yuechan_live_sources } from './yuechan_live';
// import { zbds_sources } from './zbds';
import type { TSources } from './utils';

export * from './china_iptv';
export * from './lan_proxy';
export * from './utils';

export const sources: TSources = [
  // ...fanmingming_live_sources,
  // ...yuechan_live_sources,
  // ...cymz6_lives_sources,
  // ...yang_m3u_sources,
  // ...joevess_iptv_sources,
  // ...iptv_org_sources,
  // ...iptv_org_stream_sources,
  ...hotel_tvn_sources,
  ...epg_pw_sources,
  ...qwerttvv_bj_iptv_sources,
  ...china_iptv_sources,
  ...youhun_sources,
  // ...zbds_sources,
];
