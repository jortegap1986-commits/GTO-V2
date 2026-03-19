import fs from 'fs';
import path from 'path';

function findLargeFiles(dir, minSizeMB = 1) {
  const minSizeBytes = minSizeMB * 1024 * 1024;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    // Let's not skip anything this time to see where the bulk is
    if (file === '.git') continue;

    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      try {
        findLargeFiles(fullPath, minSizeMB);
      } catch (e) {
        // Skip directories we can't read
      }
    } else if (stats.size > minSizeBytes) {
      console.log(`${fullPath}: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    }
  }
}

console.log('Searching for all files > 1MB...');
findLargeFiles(process.cwd());
