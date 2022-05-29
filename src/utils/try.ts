export async function tryOr<T, S>(defaultValue: T, func: () => Promise<S>) {
  try {
    return await func();
  } catch {
    return defaultValue;
  }
}
