import { literal, union } from 'io-ts';

export const EnvironmentT = union([literal('development'), literal('production'), literal('test')]);
