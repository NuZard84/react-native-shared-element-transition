const fs = require('fs');
const path = require('path');

// Clean lib directory
const libDir = path.join(__dirname, '..', 'lib');
if (fs.existsSync(libDir)) {
  fs.rmSync(libDir, { recursive: true, force: true });
}
fs.mkdirSync(libDir, { recursive: true });

// Copy source files to lib directory
const srcDir = path.join(__dirname, '..', 'src');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      // Convert .tsx to .js and .ts to .d.ts
      let newName = entry.name;
      if (entry.name.endsWith('.tsx')) {
        newName = entry.name.replace('.tsx', '.js');
      } else if (entry.name.endsWith('.ts')) {
        newName = entry.name.replace('.ts', '.d.ts');
      }
      
      const destFilePath = path.join(dest, newName);
      fs.copyFileSync(srcPath, destFilePath);
    }
  }
}

copyDir(srcDir, libDir);

console.log('Build completed successfully!');
