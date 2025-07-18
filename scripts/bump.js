const fs = require('fs');
const path = require('path');

function bumpVersion(version, targetVersion) {
  if (targetVersion) {
    return targetVersion;
  }
  const parts = version.split('.');
  parts[2] = (parseInt(parts[2]) + 1).toString();
  return parts.join('.');
}

function updatePackageJson(filePath, targetVersion) {
  const content = fs.readFileSync(filePath, 'utf8');
  const pkg = JSON.parse(content);

  if (pkg.version) {
    pkg.version = bumpVersion(pkg.version, targetVersion);
    fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`Updated ${filePath}: ${pkg.version}`);
  }
}

function findPackageJsonFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && item !== 'node_modules' && !item.startsWith('.')) {
        traverse(fullPath);
      } else if (item === 'package.json') {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Get version from command line argument
const targetVersion = process.argv[2];

// Find all package.json files and bump their versions
const packageFiles = findPackageJsonFiles(process.cwd());
packageFiles.forEach(file => updatePackageJson(file, targetVersion));

console.log(`Bumped ${packageFiles.length} package(s)${targetVersion ? ` to ${targetVersion}` : ''}`);
