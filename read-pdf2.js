const fs = require('fs');
const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();
const options = {};
pdfExtract.extract('copywritingAI.pdf', options, (err, data) => {
    if (err) return console.log(err);
    let text = [];
    data.pages.forEach(page => {
        page.content.forEach(item => {
            text.push(item.str);
        });
    });
    fs.writeFileSync('pdf-text.txt', text.join('\n'));
    console.log("Extraction complete.");
});
