const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'views');

function scanDir(dir, results) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath, results);
    } else if (fullPath.endsWith('.vue')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      let currentGroup = [];
      let groupLineStart = -1;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/<el-option[^>]*?label=["']([^"']+)["'][^>]*?value=(["']([^"']+)["']|\{?[^>]+}?)[^>]*?>/);
        
        if (match) {
          if (currentGroup.length === 0) groupLineStart = i + 1;
          currentGroup.push({ label: match[1], valueMatch: match[0], line: i + 1 });
        } else {
          // If we hit a non-option line but we had a group, save the group
          if (currentGroup.length > 0) {
            // Ignore single options or just enable/disable if we only want larger groups
            results.push({
               file: fullPath.replace(__dirname, ''),
               startLine: groupLineStart,
               options: [...currentGroup]
            });
            currentGroup = [];
          }
        }
      }
      if (currentGroup.length > 0) {
        results.push({
           file: fullPath.replace(__dirname, ''),
           startLine: groupLineStart,
           options: [...currentGroup]
        });
      }
    }
  }
}

const allGroups = [];
scanDir(srcDir, allGroups);

// Format output
let output = '';
for (const group of allGroups) {
  const labels = group.options.map(o => o.label).join(', ');
  output += `File: ${group.file} (Lines ${group.startLine}-${group.startLine + group.options.length - 1})\n`;
  output += `Options: ${labels}\n\n`;
}

fs.writeFileSync(path.join(__dirname, 'options_report.txt'), output);
console.log(`Found ${allGroups.length} option groups.`);
