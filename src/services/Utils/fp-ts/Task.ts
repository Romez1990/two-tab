import { Task } from 'fp-ts/Task';

export const run = <T>(task: Task<T>): Promise<T> => task();
