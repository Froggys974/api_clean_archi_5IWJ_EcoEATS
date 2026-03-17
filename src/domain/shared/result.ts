export type ResultType<T, E extends Error = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export const Result = {
  Success<T>(data: T): ResultType<T, never> {
    return { success: true, data };
  },

  Failed<E extends Error>(error: E): ResultType<never, E> {
    return { success: false, error };
  },
};