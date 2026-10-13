import * as OpenCC from 'opencc-js';

/** 繁体（香港）转简体 */
export const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
