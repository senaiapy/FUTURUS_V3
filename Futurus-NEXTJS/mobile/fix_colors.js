const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalText = content;
    
    // Replace color: colors.dark to colors.neutral
    content = content.replace(/color:\s*colors\.dark/g, 'color: colors.neutral');
    
    // Replace placeholderTextColor
    content = content.replace(/placeholderTextColor=\{colors\.dark/g, 'placeholderTextColor={colors.neutral');
    
    // Replace icon color={colors.dark
    content = content.replace(/color=\{colors\.dark/g, 'color={colors.neutral');
    
    // Replace fill={colors.dark
    content = content.replace(/fill=\{colors\.dark/g, 'fill={colors.neutral');

    if (content !== originalText) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
