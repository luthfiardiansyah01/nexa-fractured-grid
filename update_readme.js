const fs = require('fs');
const glob = require('glob');
const { execSync } = require('child_process');

// Cari semua file .js di folder project, kecuali node_modules
const files = glob.sync('**/*.js', { 
  ignore: ['node_modules/**', '**/update_readme.js'] // jangan baca script ini juga
});

let readme = '# Project Auto-Generated README\n\n';

files.forEach(file => {
  // Pastikan ini file, bukan folder
  if (fs.lstatSync(file).isFile()) {
    const code = fs.readFileSync(file, 'utf-8');
    const functions = [...code.matchAll(/function (\w+)/g)].map(m => m[1]);

    if (functions.length > 0) {
      readme += `## ${file}\n`;
      functions.forEach(fn => {
        readme += `- ${fn}()\n`;
      });
      readme += '\n';
    }
  }
});

// Tulis ke README.md
fs.writeFileSync('README.md', readme);
console.log('README.md berhasil diupdate!');

// Commit & push ke Git
try {
  execSync('git add README.md', { stdio: 'inherit' });
  execSync('git commit -m "Update README.md otomatis"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('README.md berhasil dipush ke GitHub!');
} catch (err) {
  console.log('Git commit/push gagal. Pastikan Git sudah setup dan branch benar.');
}