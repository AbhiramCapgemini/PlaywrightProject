const { execSync } = require('child_process');

try {
  const result = execSync('netstat -ano | findstr :9323', { encoding: 'utf8' });
  const lines = result.trim().split('\n');
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== '0') {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`Killed process ${pid} on port 9323`);
      } catch {}
    }
  }
} catch {
  // port not in use, nothing to kill
}
