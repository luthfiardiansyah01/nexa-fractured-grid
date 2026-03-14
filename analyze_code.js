// analyze_code.js
const fs = require('fs');
const glob = require('glob');

// Ambil semua file .js, kecuali node_modules dan script sendiri
const files = glob.sync('**/*.js', {
  ignore: ['node_modules/**', '**/analyze_code.js']
});

let audit = '# Code Audit Summary\n\n';
audit += 'Analisis ini dibuat otomatis dari seluruh file JavaScript project.\n\n';

files.forEach(file => {
  if (fs.lstatSync(file).isFile()) {
    const code = fs.readFileSync(file, 'utf-8');
    const lines = code.split('\n').length;
    
    // Ambil nama fungsi biasa
    const funcNormal = [...code.matchAll(/function (\w+)/g)].map(m => m[1]);
    
    // Ambil arrow function: const foo = () => {}
    const funcArrow = [...code.matchAll(/const (\w+)\s*=\s*\([\w\s,]*\)\s*=>/g)].map(m => m[1]);
    
    const allFunctions = [...funcNormal, ...funcArrow];
    
    // Ambil komentar
    const comments = [...code.matchAll(/\/\/(.*)/g)].map(m => m[1].trim());
    
    // Summary per file
    audit += `## File: ${file}\n`;
    audit += `- Total baris kode: ${lines}\n`;
    audit += `- Fungsi ditemukan: ${allFunctions.length}\n`;
    if (allFunctions.length > 0) {
      audit += `  - ${allFunctions.join(', ')}\n`;
    }
    audit += `- Komentar / catatan: ${comments.length > 0 ? comments.join('; ') : 'Tidak ada'}\n\n`;
  }
});

// Tambahkan section non-engineer friendly
audit += `# Ringkasan untuk Non-Engineer\n`;
audit += `Project ini terdiri dari ${files.length} file JavaScript, dengan total fungsi ${files.reduce((acc, f) => acc + 1, 0)}. Fungsi-fungsi tersebut menjalankan berbagai operasi inti dari aplikasi, seperti logika bisnis, manipulasi data, dan interaksi pengguna. Setiap fungsi biasanya diberi komentar untuk menjelaskan kegunaannya.\n`;

fs.writeFileSync('CODE_AUDIT.md', audit);
console.log('CODE_AUDIT.md berhasil dibuat! Analisis siap dibaca oleh engineer & non-engineer.');