import { literal, TypeOf, union } from 'io-ts';

export const EnvironmentT = union([literal('development'), literal('production'), literal('test')]);

export type Environment = TypeOf<typeof EnvironmentT>;
