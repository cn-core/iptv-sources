import path from 'path';

import { projectRoot } from '../file';

export const config_path = path.join(projectRoot, 'config');

export const config_custom_path = path.join(config_path, 'custom');

export const m3u_path = path.join(projectRoot, 'm3u');

export const write_custom_path = path.join(m3u_path, 'custom');
