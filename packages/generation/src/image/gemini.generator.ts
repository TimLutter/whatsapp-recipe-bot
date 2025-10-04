import { BaseImageGenerator } from './base.js';

export class GeminiImageGenerator extends BaseImageGenerator {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async generate(prompt: string): Promise<Buffer> {
    console.log('🎨 Generating image with Gemini Imagen...');
    console.log(`   Prompt: ${prompt}`);

    // Gemini Imagen 3 API endpoint
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict',
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
            },
          ],
          parameters: {
            sampleCount: 1,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json() as {
      predictions?: Array<{
        bytesBase64Encoded?: string;
      }>;
    };

    if (!result.predictions || !result.predictions[0]?.bytesBase64Encoded) {
      throw new Error('No image data in Gemini response');
    }

    // Convert base64 to buffer
    const imageBase64 = result.predictions[0].bytesBase64Encoded;
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    console.log(`   ✅ Image generated successfully (${imageBuffer.length} bytes)`);

    return imageBuffer;
  }
}
