const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');

});

app.post('/upload', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const buffer = req.file.buffer;
  const fileName = req.file.originalname;

  if (fileName.endsWith('.pdf')) {
    // For PDF files
    pdfParse(buffer).then(data => {
      res.send(data.text);
    }).catch(error => {
      res.status(500).send('Error parsing PDF.');
    });
  } else if (fileName.endsWith('.docx')) {
    // For Word documents
    mammoth.extractRawText({ arrayBuffer: buffer })
      .then(result => {
        res.send(result.value);
      })
      .catch(error => {
        res.status(500).send('Error parsing Word document.');
      });
  } else {
    res.status(400).send('Unsupported file format.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
