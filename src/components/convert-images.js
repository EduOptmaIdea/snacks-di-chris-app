const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const convertToWebP = async (inputPath, outputPath) => {
  await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath);
};

// Rodar isso antes do build
fs.readdirSync('./src/assets/images').forEach(file => {
  if (file.endsWith('.jpg') || file.endsWith('.png')) {
    const input = path.join('./src/assets/imgs', file);
    const output = input.replace(/(\.jpg|\.png)/, '.webp');
    convertToWebP(input, output);
  }
});