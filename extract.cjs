const fs = require('fs');
const PDFParser = require("pdf2json");
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const apiKnowledgeDir = path.join(__dirname, 'api', 'knowledge');
const bookPath = path.join(publicDir, 'Designing for AGENCY (Final DRAFT) .pdf');
const slidesPath = path.join(publicDir, 'AIFE Yokohama Draft .pdf');

function extractText(pdfPath, outputPath, exportName) {
    return new Promise((resolve, reject) => {
        console.log(`Extracting text from ${pdfPath}...`);
        const pdfParser = new PDFParser(this, 1);

        pdfParser.on("pdfParser_dataError", errData => {
            console.error(`Error processing ${pdfPath}:`, errData.parserError);
            reject(errData.parserError);
        });

        pdfParser.on("pdfParser_dataReady", pdfData => {
            const rawText = pdfParser.getRawTextContent();
            // Clean up the text a bit
            let text = rawText.replace(/\r\n/g, '\n').replace(/\n\n+/g, '\n\n').trim();
            const tsContent = `export const ${exportName} = ${JSON.stringify(text)};\n`;
            
            if (!fs.existsSync(apiKnowledgeDir)) {
                fs.mkdirSync(apiKnowledgeDir, { recursive: true });
            }
            fs.writeFileSync(outputPath, tsContent);
            console.log(`Successfully extracted text to ${outputPath}`);
            resolve();
        });

        pdfParser.loadPDF(pdfPath);
    });
}

async function main() {
    try {
        await extractText(bookPath, path.join(apiKnowledgeDir, 'book_knowledge.ts'), 'BOOK_KNOWLEDGE');
        await extractText(slidesPath, path.join(apiKnowledgeDir, 'slides_knowledge.ts'), 'SLIDES_KNOWLEDGE');
        console.log('Knowledge extraction complete.');
    } catch (e) {
        console.error("Extraction failed", e);
    }
}

main();
