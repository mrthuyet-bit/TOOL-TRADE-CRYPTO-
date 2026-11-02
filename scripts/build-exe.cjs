const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Step 1: Building Vite Frontend...');
execSync('npx.cmd vite build', { stdio: 'inherit' });

const outputDir = path.join(__dirname, '..', 'release', 'Meme Coin Radar');
console.log(`📦 Step 2: Preparing standalone Windows App in: ${outputDir}`);

if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// Copy all Electron binary files from node_modules/electron/dist
const electronDist = path.join(__dirname, '..', 'node_modules', 'electron', 'dist');

console.log('📂 Step 3: Copying Electron runtime binaries...');
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy runtime except default_app
for (const item of fs.readdirSync(electronDist)) {
  if (item === 'electron.exe') {
    // Rename electron.exe to 'Meme Coin Radar.exe'
    fs.copyFileSync(
      path.join(electronDist, item),
      path.join(outputDir, 'Meme Coin Radar.exe')
    );
  } else if (item === 'resources') {
    const resDir = path.join(outputDir, 'resources');
    fs.mkdirSync(resDir, { recursive: true });
    // Don't copy default_app.asar
    for (const resItem of fs.readdirSync(path.join(electronDist, 'resources'))) {
      if (resItem !== 'default_app.asar') {
        copyRecursive(
          path.join(electronDist, 'resources', resItem),
          path.join(resDir, resItem)
        );
      }
    }
  } else {
    copyRecursive(path.join(electronDist, item), path.join(outputDir, item));
  }
}

console.log('📄 Step 4: Packaging application files into resources/app...');
const appDir = path.join(outputDir, 'resources', 'app');
fs.mkdirSync(appDir, { recursive: true });

// Copy dist/
copyRecursive(path.join(__dirname, '..', 'dist'), path.join(appDir, 'dist'));

// Copy electron/
copyRecursive(path.join(__dirname, '..', 'electron'), path.join(appDir, 'electron'));

// Create app package.json
const appPackage = {
  name: 'meme-coin-radar',
  version: '1.0.0',
  main: 'electron/main.cjs',
};
fs.writeFileSync(
  path.join(appDir, 'package.json'),
  JSON.stringify(appPackage, null, 2)
);

// Đồng bộ sang thư mục Desktop nếu có
const desktopAppDir = 'C:\\Users\\lovan\\OneDrive\\Máy tính\\tool crypto\\release\\Meme Coin Radar\\resources\\app';
try {
  if (fs.existsSync('C:\\Users\\lovan\\OneDrive\\Máy tính\\tool crypto\\release\\Meme Coin Radar')) {
    console.log('🔄 Đồng bộ bản cập nhật sang Desktop (OneDrive/Máy tính)...');
    copyRecursive(appDir, desktopAppDir);
  }
} catch (syncErr) {
  console.warn('Sync to desktop app warning:', syncErr.message);
}

console.log('\n✨ THÀNH CÔNG! Đã đóng gói xong phần mềm Windows EXE:');
console.log(`📍 File chạy trực tiếp: ${path.join(outputDir, 'Meme Coin Radar.exe')}`);
