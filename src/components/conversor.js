import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configurações
const QUALITY = 80;
const IMG_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const SVG_EXTENSION = '.svg';

// Função para converter imagens para WebP
const convertToWebP = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .webp({ quality: QUALITY })
      .toFile(outputPath);
    console.log(`✅ Converted ${path.basename(inputPath)} to WebP`);
    return true;
  } catch (error) {
    console.error(`❌ Error converting ${path.basename(inputPath)}:`, error.message);
    return false;
  }
};

// Função para otimizar SVG (apenas minifica)
const optimizeSVG = async (inputPath, outputPath) => {
  try {
    const content = await readFile(inputPath, 'utf8');
    const optimized = content
      .replace(/\s+/g, ' ')
      .replace(/<!--.*?-->/g, '')
      .trim();

    await writeFile(outputPath, optimized);
    console.log(`⚡ Optimized ${path.basename(inputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error optimizing ${path.basename(inputPath)}:`, error.message);
    return false;
  }
};

// Processa um diretório recursivamente
const processDirectory = async (dirPath) => {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    let convertedCount = 0;

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      const ext = path.extname(item.name).toLowerCase();

      if (item.isDirectory()) {
        convertedCount += await processDirectory(fullPath);
      }
      else if (IMG_EXTENSIONS.includes(ext)) {
        const outputPath = path.join(dirPath, `${path.basename(item.name, ext)}.webp`);

        // Verifica se o arquivo WebP já existe e se está atualizado
        if (!fs.existsSync(outputPath)) {
          const success = await convertToWebP(fullPath, outputPath);
          if (success) convertedCount++;
        } else {
          // Verifica se o arquivo original foi modificado após a conversão
          const statsOrig = fs.statSync(fullPath);
          const statsWebP = fs.statSync(outputPath);

          if (statsOrig.mtimeMs > statsWebP.mtimeMs) {
            const success = await convertToWebP(fullPath, outputPath);
            if (success) convertedCount++;
          }
        }
      }
      else if (ext === SVG_EXTENSION) {
        // Verifica se o arquivo já é minificado
        if (item.name.endsWith('.min.svg')) {
          continue;
        }

        const baseName = path.basename(item.name, ext);
        const optimizedPath = path.join(dirPath, `${baseName}.min.svg`);

        // Verifica se o arquivo minificado já existe e se está atualizado
        if (!fs.existsSync(optimizedPath)) {
          const success = await optimizeSVG(fullPath, optimizedPath);
          if (success) convertedCount++;
        } else {
          // Verifica se o arquivo original foi modificado após a minificação
          const statsOrig = fs.statSync(fullPath);
          const statsMin = fs.statSync(optimizedPath);

          if (statsOrig.mtimeMs > statsMin.mtimeMs) {
            const success = await optimizeSVG(fullPath, optimizedPath);
            if (success) convertedCount++;
          }
        }
      }
    }

    return convertedCount;
  } catch (error) {
    console.error(`⚠️ Error processing ${dirPath}:`, error.message);
    return 0;
  }
};

// Diretórios a serem processados
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*const directoriesToProcess = [
  path.join(__dirname, '../../public/categories'),
  path.join(__dirname, '../../public/products'),
  path.join(__dirname, '../../src/assets/imgs/icons')
];*/

// Execução principal
(async () => {
  console.log('🔄 Starting image conversion...');
  /* console.log('📂 Directories to process:');
  directoriesToProcess.forEach(dir => console.log(`- ${dir}`));

  let totalConverted = 0;
  const startTime = Date.now();

  for (const dir of directoriesToProcess) {
    if (fs.existsSync(dir)) {
      console.log(`\n🔍 Processing ${path.basename(dir)}...`);
      const count = await processDirectory(dir);
      totalConverted += count;
      console.log(`✔️ Converted ${count} files in ${path.basename(dir)}`);
    } else {
      console.log(`⏩ Skipping non-existent directory: ${dir}`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨ Done! Converted ${totalConverted} files in ${duration}s`);*/
})();