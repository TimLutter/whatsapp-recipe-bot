import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import { readFileSync } from 'fs';
import type { Recipe } from '@whatsapp-recipe-bot/core';

export async function generateRecipePdf(recipe: Recipe, recipeUrl: string, imageBuffer?: Buffer): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(recipeUrl, {
      width: 150,
      margin: 1,
    });

    // Convert image buffer to data URL if provided
    let imageDataUrl = '';
    if (imageBuffer) {
      imageDataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    }

    // Load FamFood logo
    const logoPath = '/Users/timlutter/Desktop/_FamFood/_LOGO NEW/No White Line/_PNG/FamFood_Logo_356x222px.png';
    const logoBuffer = readFileSync(logoPath);
    const logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;

    // Create HTML content
    const html = createPdfHtml(recipe, recipeUrl, imageDataUrl, qrCodeDataUrl, logoDataUrl);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

function createPdfHtml(recipe: Recipe, recipeUrl: string, imageUrl: string, qrCodeUrl: string, logoUrl: string): string {
  const ingredientsList = recipe.ingredients
    .map((ing) => `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`)
    .join('');

  const stepsList = recipe.steps
    .map((step) => `<li>${step.instruction}${step.duration ? ` <em>(${step.duration} Min.)</em>` : ''}</li>`)
    .join('');

  const tags = recipe.tags.slice(0, 6).map((tag) => `<span class="tag">${tag}</span>`).join(' ');

  const nutritionInfo = recipe.nutritionalInfo
    ? `
    <div class="nutrition">
      <div class="nutrition-item">
        <div class="label">Kalorien</div>
        <div class="value">${recipe.nutritionalInfo.calories || '-'} kcal</div>
      </div>
      <div class="nutrition-item">
        <div class="label">Protein</div>
        <div class="value">${recipe.nutritionalInfo.protein || '-'}g</div>
      </div>
      <div class="nutrition-item">
        <div class="label">Kohlenhydrate</div>
        <div class="value">${recipe.nutritionalInfo.carbs || '-'}g</div>
      </div>
      <div class="nutrition-item">
        <div class="label">Fett</div>
        <div class="value">${recipe.nutritionalInfo.fat || '-'}g</div>
      </div>
    </div>
  `
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Bree+Serif&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page {
          margin: 0;
          size: A4 portrait;
        }
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #030424;
          color: #ffffff;
          padding: 12mm 15mm;
          font-size: 14px;
          line-height: 1.6;
          display: flex;
          flex-direction: column;
          min-height: 297mm;
        }
        .header {
          text-align: center;
          margin-bottom: 10mm;
        }
        h1 {
          font-family: 'Bree Serif', serif;
          color: #ffffff;
          font-size: 42px;
          line-height: 1.1;
        }
        .content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12mm;
          flex: 1;
        }
        .left-column {
          display: flex;
          flex-direction: column;
          gap: 8mm;
        }
        .image-container {
          width: 100%;
          height: 0;
          padding-bottom: 100%;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 4px solid #3d8202;
          flex-shrink: 0;
        }
        .image-container img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .nutrition {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          background: rgba(61, 130, 2, 0.15);
          padding: 15px;
          border-radius: 12px;
          border: 2px solid rgba(61, 130, 2, 0.3);
        }
        .nutrition-item {
          text-align: center;
          padding: 10px 5px;
        }
        .nutrition-item .label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        .nutrition-item .value {
          font-family: 'Bree Serif', serif;
          font-size: 24px;
          color: #3d8202;
          font-weight: bold;
        }
        .right-column {
          display: flex;
          flex-direction: column;
        }
        .section {
          display: flex;
          flex-direction: column;
        }
        .section + .section {
          margin-top: 0;
        }
        h2 {
          font-family: 'Bree Serif', serif;
          color: #3d8202;
          font-size: 28px;
          margin-bottom: 10px;
          margin-top: 15px;
          border-bottom: 3px solid #3d8202;
          padding-bottom: 6px;
          flex-shrink: 0;
        }
        .section:first-child h2 {
          margin-top: 0;
        }
        ul {
          list-style: none;
          padding-left: 0;
        }
        li {
          padding-left: 25px;
          margin-bottom: 12px;
          position: relative;
          font-size: 15px;
          line-height: 1.7;
        }
        li:before {
          content: "•";
          color: #3d8202;
          font-weight: bold;
          position: absolute;
          left: 0;
          font-size: 20px;
        }
        .footer {
          margin-top: 10mm;
          padding-top: 6mm;
          border-top: 3px solid rgba(61, 130, 2, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-width: 45%;
        }
        .tag {
          background: #3d8202;
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 600;
        }
        .qr-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .qr-section img {
          width: 80px;
          height: 80px;
        }
        .qr-section .qr-text {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
        }
        .branding {
          text-align: right;
        }
        .branding img {
          height: 45px;
          width: auto;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${recipe.title}</h1>
      </div>

      <div class="content">
        <div class="left-column">
          ${imageUrl ? `<div class="image-container"><img src="${imageUrl}" alt="${recipe.title}"></div>` : ''}
          ${nutritionInfo}
        </div>

        <div class="right-column">
          <div class="section">
            <h2>🥘 Zutaten</h2>
            <ul>${ingredientsList}</ul>
          </div>

          <div class="section">
            <h2>👨‍🍳 Zubereitung</h2>
            <ul>${stepsList}</ul>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="tags">${tags}</div>
        <div class="qr-section">
          <img src="${qrCodeUrl}" alt="QR Code">
          <div class="qr-text">Scan für mehr</div>
        </div>
        <div class="branding">
          <img src="${logoUrl}" alt="FamFood">
        </div>
      </div>
    </body>
    </html>
  `;
}