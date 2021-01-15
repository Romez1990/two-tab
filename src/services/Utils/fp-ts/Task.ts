import { Task } from 'fp-ts/Task';

export const run = <T>(task: Task<T>): Promise<T> => task();

export async function runWithErrorThrowing<T>(task: Task<T>): Promise<T> {
  try {
    return await run(task);
  } catch (error) {
    setTimeout(() => {
      throw error;
    });
    throw error;
  }
}
