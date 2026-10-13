import { toSimplified, withGithubRawLogoProxy, type ISource, type TSources } from './utils';

export const yang_m3u_transform: ISource['transform'] = (playlist, filename) => {
  const proxied = withGithubRawLogoProxy(playlist);
  return [{ filename, playlist: toSimplified(proxied), candidates: proxied.channels }];
};

export const yang_m3u_sources: TSources = [
  {
    name: 'YanG-1989 Gather',
    f_name: 'y_g',
    url: 'https://raw.githubusercontent.com/YanG-1989/m3u/main/Gather.m3u',
    transform: yang_m3u_transform,
  },
];
