import fs from 'fs';
import pdfParse from 'pdf-parse';

let dataBuffer = fs.readFileSync('C:/X/Antigravity/projects/YUPPI/docs/SS.pdf');

pdfParse(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(err => {
    console.error("Error reading PDF:", err);
});
