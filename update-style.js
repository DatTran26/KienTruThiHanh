const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
  });
  return results;
}

const files = walk('src/app');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let orig = content;
  
  // Revert dark text to white inside solid primary or gradient backgrounds
  content = content.replace(/(bg-gradient-to[^"']*)text-foreground/g, '$1text-white');
  content = content.replace(/(bg-(indigo|cyan|blue|emerald|rose|amber)-[56]00[^"']*)text-foreground/g, '$1text-white');

  // Any leftover rgba that causes dark boxes
  content = content.replace(/bg-\[rgba\([^)]+\)\]/g, 'bg-white/60');
  
  // Make borders properly glassy and soft
  content = content.replace(/border-black\/\[0\.0[0-9]+\]/g, 'border-white/50');
  
  // Clean up shadow intensities 
  content = content.replace(/shadow-black\/40/g, 'shadow-black/10');
  
  if (orig !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated styling in:', file);
  }
});
