'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const sampleUrl = 'https://res.cloudinary.com/demo/video/upload/dog.mp4';
const destPath = path.join(__dirname, '../tests/fixtures/sample_test.mp4');

const dir = path.dirname(destPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log('Downloading sample MP4 from Cloudinary demo...');
const file = fs.createWriteStream(destPath);
https.get(sampleUrl, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log('Sample MP4 downloaded successfully to:', destPath, 'Size:', fs.statSync(destPath).size, 'bytes');
    });
  });
}).on('error', (err) => {
  console.error('Download error:', err.message);
});
