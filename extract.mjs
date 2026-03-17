import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');
const bookPath = path.join(publicDir, 'Designing for AGENCY (Final DRAFT) .pdf');
const slidesPath = path.join(publicDir, 'AIFE Yokohama Draft .pdf');

async function extractText(pdfPath, outputPath) {
    console.log(`Extracting text from ${pdfPath}...`);
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);

        // Clean up the text a bit
        let text = data.text.replace(/\n\n+/g, '\n\n').trim();

        fs.writeFileSync(outputPath, text);
        console.log(`Successfully extracted ${data.numpages} pages to ${outputPath}`);
    } catch (err) {
        console.error(`Error processing ${pdfPath}:`, err.message);
    }
}

async function main() {
    await extractText(bookPath, path.join(publicDir, 'book_knowledge.txt'));
    await extractText(slidesPath, path.join(publicDir, 'slides_knowledge.txt'));
    console.log('Knowledge extraction complete.');
}

main();
