import OpenAI from 'openai';
import { BaseTextGenerator } from './base.js';
import type { RecipeGenerationInput, RecipeGenerationOutput } from '@whatsapp-recipe-bot/core';

export class OpenAITextGenerator extends BaseTextGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    super();
    this.openai = new OpenAI({ apiKey });
  }

  async generate(input: RecipeGenerationInput): Promise<RecipeGenerationOutput> {
    const prompt = this.buildPrompt(input);

    console.log('📝 Generating recipe with GPT-4o-mini...');
    console.log(`   Theme: ${input.theme || 'General'}`);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional recipe creator. Generate detailed, delicious recipes in German with precise measurements and clear instructions. Always return ONLY valid JSON, no other text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(content);
    console.log('   🔍 Debug - funFact from AI:', parsed.funFact);

    // Enforce title length limit
    let title = parsed.title;
    if (title.length > 40) {
      console.log(`   ⚠️  Title too long (${title.length} chars), truncating...`);
      title = title.substring(0, 37) + '...';
    }

    // Enforce funFact length limit
    let funFact = parsed.funFact;
    if (funFact && funFact.length > 800) {
      console.log(`   ⚠️  FunFact too long (${funFact.length} chars), truncating...`);
      funFact = funFact.substring(0, 797) + '...';
    }

    console.log(`   ✅ Recipe generated: ${title}`);

    return {
      title,
      teaser: parsed.teaser,
      ingredients: parsed.ingredients,
      steps: parsed.steps,
      tags: parsed.tags || [],
      nutritionalInfo: parsed.nutritionalInfo,
      cookingTime: parsed.cookingTime,
      difficulty: parsed.difficulty,
      allergens: parsed.allergens || [],
      funFact: funFact,
    };
  }

  private buildPrompt(input: RecipeGenerationInput): string {
    const theme = input.theme || 'ein leckeres Gericht';
    const device = this.translateDevice(input.device);
    const diet = input.diet.map(d => this.translateDiet(d)).join(', ');
    const category = input.category.map(c => this.translateCategory(c)).join(', ');

    let prompt = `Erstelle ein deutsches Rezept mit folgenden Anforderungen:

Thema: ${theme}
Gerät: ${device}
Diät: ${diet}
Kategorie: ${category}`;

    // Add reference content if available
    if (input.referenceContent) {
      prompt += `\n\nReferenz-Rezept (als Inspiration verwenden, aber ein NEUES einzigartiges Rezept erstellen):\n${input.referenceContent}`;
    }

    prompt += `\n\nBitte erstelle ein vollständiges Rezept im JSON-Format mit folgender Struktur:

{
  "title": "Kurzer Rezept-Titel (MAX 40 Zeichen!)",
  "teaser": "Ein kurzer, appetitanregender Text (1-2 Sätze)",
  "cookingTime": 30,  // Gesamte Zubereitungszeit in Minuten
  "difficulty": "easy",  // "easy", "medium" oder "hard"
  "allergens": ["Gluten", "Milch"],  // Liste der Allergene (z.B. "Gluten", "Milch", "Eier", "Nüsse", "Soja", "Fisch", "Schalentiere", "Sellerie", "Senf", "Sesam", "Lupinen", "Sulfite")
  "funFact": "Ein interessanter, informativer Text über das Gericht (3-4 Sätze, MAXIMAL 800 Zeichen!). Bitte folgende Aspekte abdecken: 1) Ursprungsland/Region und ungefähres Alter des Gerichts, 2) Wie es heute verwendet/gegessen wird, 3) Gibt es internationale Variationen oder haben andere Länder/Kontinente eigene Versionen entwickelt? 4) Eine interessante Besonderheit oder Tradition. WICHTIG: Schreibe natürlich und direkt - vermeide Formulierungen wie 'Ein spannender Fun Fact ist' oder 'Interessanterweise' - sage die Fakten einfach direkt!",
  "ingredients": [
    {
      "name": "Zutat",
      "amount": "Menge als Zahl",
      "unit": "Einheit (g, ml, TL, EL, Stück, Prise, etc.)"
    }
  ],
  "steps": [
    {
      "number": 1,
      "instruction": "Schritt-Anleitung",
      "duration": 5  // Optional: Dauer in Minuten
    }
  ],
  "tags": ["Tag1", "Tag2", "Tag3"],  // 5-8 relevante Tags ohne #
  "nutritionalInfo": {
    "calories": 400,
    "protein": 25,
    "carbs": 45,
    "fat": 12
  }
}

Wichtig:
- Alle Texte auf Deutsch
- Realistische Mengenangaben
- 4-8 Zutaten
- 3-5 Zubereitungsschritte
- cookingTime = Gesamtzeit (Vorbereitung + Kochen)
- difficulty basiert auf Schwierigkeit der Zubereitung
- allergens = Liste aller Allergene im Rezept (leere Liste wenn keine)
- Tags beschreiben das Rezept (z.B. "Schnell", "Einfach", "Gesund", "${theme}")
- Nährwerte pro Portion
- Der Titel MUSS kurz und prägnant sein (MAXIMAL 40 Zeichen!)
- Titel sollte appetitlich und beschreibend sein`;

    return prompt;
  }

  private translateDevice(device: string): string {
    const map: Record<string, string> = {
      'airfryer': 'Airfryer / Heißluftfritteuse',
      'thermomix': 'Thermomix',
      'oven': 'Backofen',
      'stovetop': 'Herd / Pfanne',
      'microwave': 'Mikrowelle',
      'slow-cooker': 'Slow Cooker',
      'instant-pot': 'Instant Pot'
    };
    return map[device] || device;
  }

  private translateDiet(diet: string): string {
    const map: Record<string, string> = {
      'vegan': 'Vegan',
      'vegetarian': 'Vegetarisch',
      'keto': 'Keto',
      'low-carb': 'Low Carb',
      'high-protein': 'High Protein',
      'balanced': 'Ausgewogen',
      'gluten-free': 'Glutenfrei'
    };
    return map[diet] || diet;
  }

  private translateCategory(category: string): string {
    const map: Record<string, string> = {
      'quick': 'Schnell (unter 30 Min.)',
      '5-ingredients': 'Nur 5 Zutaten',
      'one-pot': 'One-Pot / Ein Topf',
      'sheet-pan': 'Blech-Rezept',
      'family-friendly': 'Familienfreundlich',
      'meal-prep': 'Meal Prep geeignet'
    };
    return map[category] || category;
  }
}