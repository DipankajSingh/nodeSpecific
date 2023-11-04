const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const inputPdfPath = 'input.pdf';
const outputPdfPath = 'output.pdf';

async function removeBlankPages(inputPath, outputPath) {
    const pdfBuffer = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Create a new PDF document to store non-blank pages
    const newPdfDoc = await PDFDocument.create();

    const pagePromises = pdfDoc.getPages().map(async (page, pageIndex) => {
        // Extract page text content
        const text = await page.getTextContent();

        // Check if the page has any text
        const hasText = text.items.length > 0;

        if (hasText) {
            // If the page has text, add it to the new PDF
            const copiedPage = await newPdfDoc.copyPage(page);
            newPdfDoc.addPage(copiedPage);
        }
    });

    await Promise.all(pagePromises);

    // Serialize the new PDF document to a buffer
    const newPdfBytes = await newPdfDoc.save();

    // Write the buffer to the output file
    fs.writeFileSync(outputPath, newPdfBytes);
}

removeBlankPages(inputPdfPath, outputPdfPath)
    .then(() => {
        console.log('Blank pages removed successfully.');
    })
    .catch((error) => {
        console.error('Error removing blank pages:', error);
    });
