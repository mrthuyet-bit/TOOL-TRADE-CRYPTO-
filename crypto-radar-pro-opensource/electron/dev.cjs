const { spawn } = require('child_process');
const http = require('http');

const vite = spawn('npx.cmd', ['vite'], { stdio: 'inherit', shell: true });

function checkVite(port, retries = 30) {
  const req = http.get(`http://localhost:${port}`, (res) => {
    console.log(`Vite server ready at port ${port}, launching Electron...`);
    const electronProcess = spawn('npx.cmd', ['electron', '.'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        VITE_DEV_SERVER_URL: `http://localhost:${port}`,
        NODE_ENV: 'development',
      },
    });

    electronProcess.on('close', () => {
      vite.kill();
      process.exit();
    });
  });

  req.on('error', () => {
    if (retries > 0) {
      setTimeout(() => checkVite(port, retries - 1), 500);
    } else {
      console.error('Failed to connect to Vite server');
      vite.kill();
      process.exit(1);
    }
  });
}

setTimeout(() => checkVite(5173), 1000);
