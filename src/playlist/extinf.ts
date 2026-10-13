/**
 * `#EXTINF` 行的统一解析与生成。
 *
 * 格式：`#EXTINF:<时长> key="value" key2="value2",<频道名>`
 * 以引号外的第一个逗号分隔属性与频道名，属性值里可以有逗号，如 `tvg-name="La Red, Chile"`；
 * 引号不成对时退回到按第一个逗号分隔。
 */
export interface IExtinf {
  /** 时长，直播频道为 `-1` */
  duration: string;
  /** 属性，按出现顺序；同名属性取第一个 */
  attrs: Record<string, string>;
  /** 频道名（未 trim） */
  name: string;
}

const EXTINF_LINE_REGEXP = /^#EXTINF:(-?[\d.]+)((?:[^,"]|"[^"]*")*),(.*)$/;
const EXTINF_LINE_LOOSE_REGEXP = /^#EXTINF:(-?[\d.]+)([^,]*),(.*)$/;
const ATTR_REGEXP = /([\w-]+)="([^"]*)"/g;

/** 直播频道的时长 */
export const LIVE_DURATION = '-1';

/** 频道 logo 地址前缀，文件名为频道名（CCTV 转为小写） */
export const CHANNEL_LOGO_BASE_URL = 'https://tv-res.pages.dev/logo';

export const getChannelLogoUrl = (name: string) =>
  `${CHANNEL_LOGO_BASE_URL}/${name.replace(/CCTV/g, 'cctv')}.png`;

export const parseExtinf = (line: string): IExtinf | undefined => {
  const match = EXTINF_LINE_REGEXP.exec(line) ?? EXTINF_LINE_LOOSE_REGEXP.exec(line);
  if (!match) return undefined;

  const attrs: Record<string, string> = {};
  for (const [, key, value] of match[2].matchAll(ATTR_REGEXP)) {
    attrs[key] ??= value;
  }

  return { duration: match[1], attrs, name: match[3] };
};

export const formatExtinf = ({ duration, attrs, name }: IExtinf) =>
  `#EXTINF:${duration}${Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join('')},${name}`;

export interface IChannelExtinfOptions {
  /** group-title，分组名 */
  group: string;
  /** tvg-logo，默认按频道名从 CHANNEL_LOGO_BASE_URL 取 */
  logo?: string;
}

/** 生成本项目自建频道的 EXTINF：tvg-id / tvg-name / tvg-logo / group-title */
export const buildChannelExtinf = (name: string, { group, logo }: IChannelExtinfOptions) =>
  formatExtinf({
    duration: LIVE_DURATION,
    attrs: {
      'tvg-id': name,
      'tvg-name': name,
      'tvg-logo': logo ?? getChannelLogoUrl(name),
      'group-title': group,
    },
    name,
  });

/** EXTINF 行中的频道名（未 trim），无法解析时为空字符串 */
export const getChannelName = (extinf: string) => parseExtinf(extinf)?.name ?? '';

/** 读取 EXTINF 中的属性，如 `group-title` */
export const getChannelAttr = (extinf: string, key: string): string | undefined =>
  parseExtinf(extinf)?.attrs[key];
