/** 一个频道：`#EXTINF` 行 + 播放地址 */
export interface IChannel {
  extinf: string;
  url: string;
}

export interface IPlaylist {
  /** `#EXTM3U` 头部行，上游没有时为 undefined */
  header?: string;
  channels: IChannel[];
}

export const EXTINF_REGEXP = /^#EXTINF:-1([^,]*),(.*)/;
const HEADER_REGEXP = /#EXTM3U/;
const URL_REGEXP = /^([a-z][a-z0-9+.-]*):\/\/([^/]+)/i;

/** 是否为带协议头的播放地址，如 `http://host/...`、`rtp://239.0.0.1:1234` */
export const isStreamUrl = (url: string | undefined) => !!url && URL_REGEXP.test(url);

/** EXTINF 行中第一个逗号之后的频道名（未 trim） */
export const getChannelName = (extinf: string) => EXTINF_REGEXP.exec(extinf)?.[2] ?? '';

/** 读取 EXTINF 中的属性，如 `group-title` */
export const getChannelAttr = (extinf: string, key: string) => {
  const metadata = extinf.split(',', 1)[0];
  const match = new RegExp(`${key}="([^"]*)"`).exec(metadata);
  return match?.[1];
};

const splitLines = (raw: string) =>
  raw
    .trim()
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line);

/**
 * 解析 m3u：只保留 `#EXTM3U` 头部，以及紧挨着的「`#EXTINF:-1...` + 带协议的地址」行对，
 * 其余行（注释、`#EXTVLCOPT` 等）全部丢弃。
 */
export const parseM3u = (raw: string): IPlaylist => {
  const lines = splitLines(raw);
  const playlist: IPlaylist = { channels: [] };

  for (let i = 0; i < lines.length; i++) {
    if (HEADER_REGEXP.test(lines[i])) {
      playlist.header ??= lines[i];
      continue;
    }

    if (EXTINF_REGEXP.test(lines[i]) && isStreamUrl(lines[i + 1])) {
      playlist.channels.push({ extinf: lines[i], url: lines[i + 1] });
      i++;
    }
  }

  return playlist;
};

const TXT_HEADER = '#EXTM3U x-tvg-url="https://tv.whyun.com/epg/51zmt.xml"';

/**
 * 解析 `名称,地址` 格式的 txt，`分组,#genre#` 行作为后续频道的分组，
 * 并补全 tvg-id / tvg-name / tvg-logo / group-title。
 */
export const parseTxt = (raw: string): IPlaylist => {
  const lines = raw
    .trim()
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => !!line);
  const channels: IChannel[] = [];
  let group = '未分类';

  for (const line of lines) {
    const [name, url] = line
      .trim()
      .split(',')
      .map((s) => s?.trim());
    if (url == '#genre#') {
      group = name;
      continue;
    }

    if (!name || !url) {
      continue;
    }

    const logoName = name.replace(/CCTV/g, 'cctv');
    channels.push({
      extinf: `#EXTINF:-1 tvg-id="${name}" tvg-name="${name}" \
tvg-logo="https://tv-res.pages.dev/logo/${logoName}.png" group-title="${group}",${name}`,
      url,
    });
  }

  return { header: TXT_HEADER, channels };
};

export const serializeM3u = ({ header, channels }: IPlaylist) =>
  [...(header === undefined ? [] : [header]), ...channels.flatMap((c) => [c.extinf, c.url])].join(
    '\n'
  );

/** 转为 TVBox 使用的 txt：按 group-title 分组输出 `分组,#genre#` 与 `名称,地址` */
export const toTxt = (channels: IChannel[]) => {
  const groups = new Map<string, string>();

  for (const { extinf, url } of channels) {
    const commaIndex = extinf.indexOf(',');
    const metadata = commaIndex === -1 ? extinf : extinf.slice(0, commaIndex).trim();
    const channelName = commaIndex === -1 ? '' : extinf.slice(commaIndex + 1).trim();
    const group = getChannelAttr(metadata, 'group-title')?.trim() || 'Undefined';

    groups.set(group, (groups.get(group) ?? '') + `${channelName.replace(/\s+/g, '_')},${url}\n`);
  }

  let txt = '';
  groups.forEach((lines, group) => {
    txt += `${group},#genre#\n${lines}\n`;
  });
  return txt.substring(0, txt.length - 2);
};

/** 对头部和每个频道的 extinf / url 逐行做同一个文本变换（如繁简转换） */
export const mapPlaylistText = (
  { header, channels }: IPlaylist,
  fn: (line: string) => string
): IPlaylist => ({
  header: header === undefined ? undefined : fn(header),
  channels: channels.map(({ extinf, url }) => ({ extinf: fn(extinf), url: fn(url) })),
});

export const mapChannelUrls = (
  { header, channels }: IPlaylist,
  fn: (url: string) => string
): IPlaylist => ({
  header,
  channels: channels.map(({ extinf, url }) => ({ extinf, url: fn(url) })),
});

/** 按 key 去重，保留第一次出现的频道 */
export const dedupeChannels = (channels: IChannel[], keyOf: (channel: IChannel) => string) => {
  const seen = new Set<string>();
  return channels.filter((channel) => {
    const key = keyOf(channel);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
