export function randomDelay(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function randomSleep(minMs: number, maxMs: number): Promise<void> {
  const delay = randomDelay(minMs, maxMs);
  await sleep(delay);
}