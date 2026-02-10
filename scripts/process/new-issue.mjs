import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (args.length < 2) {
  fail('Usage: npm run process:new-issue -- StepX-Y タイトル');
}

const stepId = args[0];
const title = args.slice(1).join(' ').trim();
if (!/^Step\d+-\d+$/.test(stepId)) {
  fail(`Invalid step id: ${stepId}`);
}
if (!title) {
  fail('Title is required.');
}

const planPath = path.join(root, 'docs/process/PLAN.md');
const issuePath = path.join(root, `docs/logs/issues/${stepId}.md`);
const templatePath = path.join(root, 'docs/logs/issues/ISSUE_LOG_TEMPLATE.md');

if (existsSync(issuePath)) {
  fail(`Issue log already exists: ${issuePath}`);
}

let planText = readFileSync(planPath, 'utf8');
const planIssueRegex = new RegExp(`(^- ${stepId} \\[[^\\]]+\\]:)`, 'm');
if (!planIssueRegex.test(planText)) {
  fail(`${stepId} is not found in docs/process/PLAN.md`);
}
const currentPlanLine = planText.match(new RegExp(`^- ${stepId} \\[[^\\]]+\\]:.*$`, 'm'))?.[0];
if (!currentPlanLine) {
  fail(`${stepId} line is not found in docs/process/PLAN.md`);
}
const updatedPlanLine = currentPlanLine.replace(/\[[^\]]+\]/, '[🔵 in_progress]');
planText = planText.replace(currentPlanLine, updatedPlanLine);

let content = readFileSync(templatePath, 'utf8');
content = content
  .replace(/StepX-Y/g, stepId)
  .replace('[ステータス]', '🔵 in_progress')
  .replace('[issueタイトル]', title)
  .replace('- [ ] Plan issue set to `🔵 in_progress`', '- [x] Plan issue set to `🔵 in_progress`')
  .replace('- [ ] Issue log created (`docs/logs/issues/StepX-Y.md`)', `- [x] Issue log created (\`docs/logs/issues/${stepId}.md\`)`);

writeFileSync(issuePath, content, 'utf8');
writeFileSync(planPath, planText, 'utf8');

console.log(`Created ${path.relative(root, issuePath)} and updated PLAN status to in_progress.`);
