import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (args.length < 3) {
  fail('Usage: npm run process:new-r-issue -- "内容" 種別(不具合|改善|新要件) 優先度(高|中|低)');
}

const contentSummary = args[0].trim();
const issueType = args[1].trim();
const priority = args[2].trim();

if (!contentSummary) fail('内容 is required.');
if (!['不具合', '改善', '新要件'].includes(issueType)) fail(`Invalid 種別: ${issueType}`);
if (!['高', '中', '低'].includes(priority)) fail(`Invalid 優先度: ${priority}`);

const rDir = path.join(root, 'docs/logs/r_issues');
const planPath = path.join(root, 'docs/process/PLAN.md');
const metaPath = path.join(root, 'docs/logs/r_issues/meta.yaml');
const templatePath = path.join(root, 'docs/logs/r_issues/R_ISSUE_LOG_TEMPLATE.md');

const numbers = new Set();
for (const file of readdirSync(rDir)) {
  const match = file.match(/^r(\d+)\.md$/);
  if (match) numbers.add(Number.parseInt(match[1], 10));
}

const planTextCurrent = readFileSync(planPath, 'utf8');
for (const match of planTextCurrent.matchAll(/^- r(\d+) \/ /gm)) {
  numbers.add(Number.parseInt(match[1], 10));
}

const metaTextCurrent = readFileSync(metaPath, 'utf8');
for (const match of metaTextCurrent.matchAll(/^  - r(\d+)\.md$/gm)) {
  numbers.add(Number.parseInt(match[1], 10));
}

const maxNumber = numbers.size > 0 ? Math.max(...numbers) : 0;
const nextNumber = maxNumber + 1;
const id = `r${nextNumber}`;
const fileName = `${id}.md`;
const filePath = path.join(rDir, fileName);

if (existsSync(filePath)) {
  fail(`File already exists: ${filePath}`);
}

const today = new Date().toISOString().slice(0, 10);
let body = readFileSync(templatePath, 'utf8');
body = body
  .replace('[ID]', id)
  .replace('[内容]', contentSummary)
  .replace('[種別: 不具合/改善/新要件]', issueType)
  .replace('[優先度: 高/中/低]', priority)
  .replace('[状態: 🟡 open]', '🟡 open')
  .replace('[YYYY-MM-DD]', today)
  .replace('[起票内容]', '初期起票')
  .replace('[発見日時・発見場所・関連issue/PR/commit]', '記入予定')
  .replace('[何が問題か。観測された症状]', '記入予定')
  .replace('[誰に何の影響があるか。なければ「なし」]', '記入予定')
  .replace('[採用案 / 却下案 / 理由]', '記入予定')
  .replace('[実施タスク。Stepやissueへの紐付け]', '記入予定')
  .replace('[完了条件]', '記入予定')
  .replace('[関連テスト・ログ・コミット・ファイル]', '記入予定')
  .replace('[対応内容] または「未対応」', '未対応')
  .replace('[変更したファイルの一覧]', `docs/logs/r_issues/${fileName}, docs/logs/r_issues/meta.yaml, docs/process/PLAN.md`);

writeFileSync(filePath, body, 'utf8');

const metaLines = metaTextCurrent.trimEnd().split('\n');
metaLines.push(`  - ${fileName}`);
writeFileSync(metaPath, `${metaLines.join('\n')}\n`, 'utf8');

const planLines = planTextCurrent.split('\n');
const rLine = `- ${id} / ${contentSummary} / ${issueType} / ${priority} / 🟡 open`;
let insertAt = -1;
for (let i = 0; i < planLines.length; i += 1) {
  if (/^- r\d+ \/ /.test(planLines[i])) insertAt = i;
}
if (insertAt === -1) {
  fail('r-issue section not found in docs/process/PLAN.md');
}
planLines.splice(insertAt + 1, 0, rLine);
writeFileSync(planPath, `${planLines.join('\n')}\n`, 'utf8');

console.log(`Created ${path.relative(root, filePath)} and updated PLAN/meta.`);
