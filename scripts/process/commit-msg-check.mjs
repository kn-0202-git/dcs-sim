import { readFileSync } from 'node:fs';

const messageFile = process.argv[2];
if (!messageFile) {
  console.error('Usage: node scripts/process/commit-msg-check.mjs <commit-message-file>');
  process.exit(1);
}

const message = readFileSync(messageFile, 'utf8').split('\n')[0].trim();

if (message.startsWith('Merge ') || message.startsWith('Revert ')) {
  process.exit(0);
}

const pattern = /^(feat|fix|refactor|docs|test|chore|ci|perf|sec|process)\([a-z0-9_-]+\): .+ \[(Step\d+-\d+|r\d+)\]$/;
if (!pattern.test(message)) {
  console.error('Invalid commit message format.');
  console.error('Required: <type>(<scope>): <summary> [StepX-Y|rN]');
  console.error('Example: process(logs): enforce process-check in CI [r21]');
  process.exit(1);
}
