import { toSimplified, withGithubRawLogoProxy, type ISource, type TSources } from './utils';

export const yangM3uTransform: ISource['transform'] = (playlist, filename) => {
  const proxied = withGithubRawLogoProxy(playlist);
  return [{ filename, playlist: toSimplified(proxied), candidates: proxied.channels }];
};

export const yangM3uSources: TSources = [
  {
    name: 'YanG-1989 Gather',
    filename: 'y_g',
    url: 'https://raw.githubusercontent.com/YanG-1989/m3u/main/Gather.m3u',
    transform: yangM3uTransform,
  },
];
