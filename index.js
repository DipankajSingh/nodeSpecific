import * as pdf_Dist from 'pdfjs-dist';
import fs from 'fs';
import { PDFDocument, range } from "pdf-lib"
import { homedir } from 'os';
import keypress from 'keypress';
import { clear } from 'console';

const downloadDir = homedir() + '/Downloads';

// create a new folder called no_blanks on the download directory
try {
    fs.mkdirSync(downloadDir + '/no_blanks');
} catch (error) {
    if (error.code !== 'EEXIST') {
        console.log('\x1b[41m 0_0 nice! \x1b[0m');
    }
}
const outPutFolder = homedir() + '/Downloads/no_blanks';

fs.watch(downloadDir, { persistent: true }, (event, filename) => {
    console.log(event)
    //return if the event type is Unconfirmed
    if (event !== 'rename') {
        return
    }

    //check if the file is exists
    if (!fs.existsSync(downloadDir + '/' + filename)) {
        console.log('\x1b[41m ok deleted \x1b[0m');
        return
    }

    // check if the file is a pdf with regex
    if (filename.match(/\.pdf$/)) {
        console.log("New file: " + filename);
        console.log("\x1b[51m Removing blank pages... \x1b[0m");
        removeBlankPages(downloadDir + '/' + filename)
    }


})


function removeBlankPages(filePath) {
    pdf_Dist.getDocument(filePath).promise.then(async (pdfDoc) => {
        let pageToInclude = []
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            await pdfDoc.getPage(i).then(async (page) => {

                const text = await page.getTextContent();
                if (text.items.length > 0) {
                    pageToInclude.push(i - 1)
                }

            });
        }

        const pdfFileBuffer = fs.readFileSync(filePath);


        PDFDocument.load(pdfFileBuffer).then(async (PDFDoc) => {
            const oldPages = PDFDoc.getPages()
            const newPdfDoc = await PDFDocument.create()

            pageToInclude.sort()

            const copiesOfPages = await newPdfDoc.copyPages(PDFDoc, pageToInclude)
            copiesOfPages.forEach((page) => {
                newPdfDoc.addPage(page)
            })
            const newDocBuffer = await newPdfDoc.save()

            fs.writeFileSync(outPutFolder + `/no_blanks-${new Date().getTime()}.pdf`, newDocBuffer)

        })
        process.stdin.pause();
        clear()
        console.log('finished')
        console.log(pageToInclude.length, ': pages included')

    });
}

// now tell the user that the setup is complete
console.log('\x1b[32m Setup is complete o_O \x1b[0m');
console.log("watching for pdf files in ", downloadDir)

// pdf_Dist.getDocument("ROUND-1.pdf").promise.then(async (pdfDoc) => {
//     let pageToInclude = []
//     for (let i = 1; i <= pdfDoc.numPages; i++) {
//         await pdfDoc.getPage(i).then(async (page) => {

//             const text = await page.getTextContent();
//             if (text.items.length > 0) {
//                 pageToInclude.push(i - 1)
//             }

//         });
//     }

//     const pdfFileBuffer = fs.readFileSync('./ROUND-1.pdf');


//     PDFDocument.load(pdfFileBuffer).then(async (PDFDoc) => {
//         const oldPages = PDFDoc.getPages()
//         const newPdfDoc = await PDFDocument.create()

//         pageToInclude.sort()

//         const copiesOfPages = await newPdfDoc.copyPages(PDFDoc, pageToInclude)
//         copiesOfPages.forEach((page) => {
//             newPdfDoc.addPage(page)
//         })
//         const newDocBuffer = await newPdfDoc.save()

//         fs.writeFileSync("./output" + '/no_blanks.pdf', newDocBuffer)

//     })
//     process.stdin.pause();
//     clear()
//     console.log('finished')
//     console.log(pageToInclude.length, ': pages included')

// });