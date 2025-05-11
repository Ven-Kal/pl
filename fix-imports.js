// fix-imports.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile()) {
      callback(filepath);
    }
  });
}

const distDir = path.join(__dirname, 'dist');

walkSync(distDir, (filePath) => {
  if (path.extname(filePath) === '.js') {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix imports with .ts extensions
    const updatedContent = content.replace(/from\s+(['"])(.+?)\.ts\1/g, 'from $1$2.js$1');
    
    // Fix imports without extensions that should have .js
    // This regex is more complex and may need adjustments based on your codebase
    const furtherUpdated = updatedContent.replace(/from\s+(['"])([^'"]*?\/[^'"]*?)(?!\.\w)\1/g, 'from $1$2.js$1');
    
    if (content !== furtherUpdated) {
      console.log(`Fixed imports in ${filePath}`);
      fs.writeFileSync(filePath, furtherUpdated, 'utf8');
    }
  }
});

console.log('Import paths fixed successfully!');