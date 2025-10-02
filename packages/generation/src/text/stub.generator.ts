import { BaseTextGenerator } from './base.js';
import type { RecipeGenerationInput, RecipeGenerationOutput } from '@whatsapp-recipe-bot/core';

export class StubTextGenerator extends BaseTextGenerator {
  async generate(input: RecipeGenerationInput): Promise<RecipeGenerationOutput> {
    const deviceName = this.getDeviceName(input.device);
    const dietNames = input.diet.join(', ');

    return {
      title: `${deviceName} ${input.category[0]} Rezept`,
      teaser: `Ein köstliches ${dietNames} Rezept für ${deviceName}! Schnell, einfach und lecker. 🍽️`,
      ingredients: [
        { amount: '500', unit: 'g', name: 'Hähnchenbrust' },
        { amount: '2', unit: 'EL', name: 'Olivenöl' },
        { amount: '1', unit: 'TL', name: 'Paprikapulver' },
        { amount: '1', unit: 'TL', name: 'Knoblauchpulver' },
        { amount: '1', unit: 'Prise', name: 'Salz und Pfeffer' },
      ],
      steps: [
        {
          number: 1,
          instruction: 'Hähnchenbrust in mundgerechte Stücke schneiden.',
          duration: 5,
        },
        {
          number: 2,
          instruction: 'Mit Olivenöl, Gewürzen, Salz und Pfeffer marinieren.',
          duration: 2,
        },
        {
          number: 3,
          instruction: `Im ${deviceName} bei 180°C für 15-20 Minuten garen.`,
          duration: 20,
        },
        {
          number: 4,
          instruction: 'Heiß servieren und genießen!',
        },
      ],
      tags: ['schnell', 'einfach', 'familienfreundlich'],
      nutritionalInfo: {
        calories: 320,
        protein: 42,
        carbs: 2,
        fat: 15,
        fiber: 0,
      },
    };
  }

  private getDeviceName(device: string): string {
    const map: Record<string, string> = {
      airfryer: 'Airfryer',
      thermomix: 'Thermomix',
      microwave: 'Mikrowelle',
      oven: 'Backofen',
      stovetop: 'Herd',
    };
    return map[device] || device;
  }
}