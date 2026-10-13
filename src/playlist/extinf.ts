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

/** 编码 URL 路径中不安全的字符（空白、引号、`#`、`?`、`/` 等），中文保持原样 */
const encodeLogoName = (name: string) =>
  name.replace(/[\s"#%/?\\[\]{}|^`<>]/g, (c) => encodeURIComponent(c));

export const getChannelLogoUrl = (name: string) =>
  `${CHANNEL_LOGO_BASE_URL}/${encodeLogoName(name.replace(/CCTV/g, 'cctv'))}.png`;

const matchExtinf = (line: string) =>
  EXTINF_LINE_REGEXP.exec(line) ?? EXTINF_LINE_LOOSE_REGEXP.exec(line);

export const parseExtinf = (line: string): IExtinf | undefined => {
  const match = matchExtinf(line);
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

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 设置属性：已有则原位替换值，没有则追加到属性末尾 */
const setAttr = (attrsPart: string, key: string, value: string) => {
  const quoted = `${key}="${value.replace(/"/g, '')}"`;
  const existing = new RegExp(`(^|\\s)${escapeRegExp(key)}="[^"]*"`);
  if (existing.test(attrsPart)) {
    return attrsPart.replace(existing, (_, sep: string) => `${sep}${quoted}`);
  }

  const [, body, trailing] = /^(.*?)(\s*)$/.exec(attrsPart)!;
  return `${body} ${quoted}${trailing}`;
};

/**
 * 只修改给出的频道名和属性，行内其他内容（未加引号的属性、空格等）原样保留；
 * 没有任何变化时返回原字符串。无法解析的行原样返回。
 */
export const updateExtinf = (
  line: string,
  { name, attrs = {} }: { name?: string; attrs?: Record<string, string> }
) => {
  const match = matchExtinf(line);
  const parsed = parseExtinf(line);
  if (!match || !parsed) return line;

  let attrsPart = match[2];
  for (const [key, value] of Object.entries(attrs)) {
    if (parsed.attrs[key] !== value) {
      attrsPart = setAttr(attrsPart, key, value);
    }
  }

  return `#EXTINF:${match[1]}${attrsPart},${name ?? match[3]}`;
};

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
