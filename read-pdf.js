const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('copywritingAI.pdf');

pdf(dataBuffer).then(function (data) {
    fs.writeFileSync('pdf-text.txt', data.text);
    console.log("PDF text extracted to pdf-text.txt");
}).catch(console.log);
