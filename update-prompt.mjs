import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'prompt.md');
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', '.vscode', '.lighthouseci', 'playwright-report'];
const INCLUDE_EXTENSIONS = ['.ts', '.js', '.json', '.html', '.css', '.tsx', '.jsx', '.vue'];

function isFileRelevant(filePath) {
  const ext = path.extname(filePath);
  if (!INCLUDE_EXTENSIONS.includes(ext)) return false;

  // Avoid common config files that might be redundant if already included,
  // but keep the main ones like package.json and tsconfig.json
  const fileName = path.basename(filePath);
  if (fileName === 'package-lock.json' || fileName === 'yarn.lock' || fileName === 'pnpm-lock.yaml') return false;

  return true;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (isFileRelevant(fullPath)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function main() {
  try {
    const files = getAllFiles(PROJECT_ROOT);
    let content = '';

    // Sort files to keep a consistent order (optional but helpful)
    files.sort().forEach((filePath) => {
      const relativePath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      content += `## ${relativePath}\n\n\`\`\`\n${fileContent}\n\`\`\`\n\n---\n\n`;
    });

    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    console.log(`Successfully updated ${OUTPUT_FILE} with ${files.length} files.`);
  } catch (err) {
    console.error('Error updating prompt.md:', err);
    process.exit(1);
  }
}

main();
