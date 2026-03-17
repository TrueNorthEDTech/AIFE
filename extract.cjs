const fs = require('fs');
const PDFParser = require("pdf2json");
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const bookPath = path.join(publicDir, 'Designing for AGENCY (Final DRAFT) .pdf');
const slidesPath = path.join(publicDir, 'AIFE Yokohama Draft .pdf');

function extractText(pdfPath, outputPath) {
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
            fs.writeFileSync(outputPath, text);
            console.log(`Successfully extracted text to ${outputPath}`);
            resolve();
        });

        pdfParser.loadPDF(pdfPath);
    });
}

async function main() {
    try {
        await extractText(bookPath, path.join(publicDir, 'book_knowledge.txt'));
        await extractText(slidesPath, path.join(publicDir, 'slides_knowledge.txt'));
        console.log('Knowledge extraction complete.');
    } catch (e) {
        console.error("Extraction failed", e);
    }
}

main();
