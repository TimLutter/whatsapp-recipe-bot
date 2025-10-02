import { randomDelay, randomSleep } from '@whatsapp-recipe-bot/core';

export interface HumanizeConfig {
  typoRate: number; // 0.02 = 2%
  minDelayMs: number;
  maxDelayMs: number;
}

export async function typeHuman(
  typeFunc: (text: string) => Promise<void>,
  text: string,
  config: HumanizeConfig
): Promise<void> {
  const chars = text.split('');

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // Random typing delay
    const delay = randomDelay(config.minDelayMs, config.maxDelayMs);
    await randomSleep(Math.floor(delay * 0.3), Math.floor(delay * 0.7));

    // Simulate typo
    if (Math.random() < config.typoRate && /[a-zA-Z]/.test(char)) {
      // Type wrong character
      const wrongChar = getAdjacentKey(char);
      await typeFunc(wrongChar);

      // Pause (human realizes mistake)
      await randomSleep(100, 300);

      // Backspace
      await typeFunc('\b');

      // Slight pause before correct character
      await randomSleep(50, 150);
    }

    // Type correct character
    await typeFunc(char);
  }
}

function getAdjacentKey(char: string): string {
  const keyboard: Record<string, string[]> = {
    'a': ['q', 's', 'w'],
    'b': ['v', 'g', 'n'],
    'c': ['x', 'd', 'v'],
    'd': ['s', 'e', 'f', 'c'],
    'e': ['w', 'r', 'd'],
    'f': ['d', 'r', 'g', 'v'],
    'g': ['f', 't', 'h', 'b'],
    'h': ['g', 'y', 'j', 'n'],
    'i': ['u', 'o', 'k'],
    'j': ['h', 'u', 'k', 'm'],
    'k': ['j', 'i', 'l', 'm'],
    'l': ['k', 'o', 'p'],
    'm': ['n', 'j', 'k'],
    'n': ['b', 'h', 'm'],
    'o': ['i', 'p', 'l'],
    'p': ['o', 'l'],
    'q': ['w', 'a'],
    'r': ['e', 't', 'f'],
    's': ['a', 'w', 'd', 'x'],
    't': ['r', 'y', 'g'],
    'u': ['y', 'i', 'j'],
    'v': ['c', 'f', 'b'],
    'w': ['q', 'e', 's'],
    'x': ['z', 's', 'c'],
    'y': ['t', 'u', 'h'],
    'z': ['a', 'x'],
  };

  const lower = char.toLowerCase();
  const adjacent = keyboard[lower];

  if (adjacent && adjacent.length > 0) {
    const wrongKey = adjacent[Math.floor(Math.random() * adjacent.length)];
    return char === char.toUpperCase() ? wrongKey.toUpperCase() : wrongKey;
  }

  return char;
}