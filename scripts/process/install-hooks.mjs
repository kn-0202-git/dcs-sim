import { execSync } from 'node:child_process';

try {
  execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });
  console.log('Installed git hooks path: .githooks');
} catch (error) {
  console.error('Failed to configure git hooks path.');
  process.exit(1);
}
