import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

function read(rel) {
  return readFileSync(path.join(root, rel), 'utf8');
}

function listFiles(rel, pattern) {
  return readdirSync(path.join(root, rel)).filter(name => pattern.test(name)).sort();
}

function hasHeader(content, header) {
  const pattern = new RegExp(`^${header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm');
  return pattern.test(content);
}

function parseMetaDocumentLines(rel, pattern) {
  const content = read(rel);
  return Array.from(content.matchAll(new RegExp(`^  - (${pattern})$`, 'gm'))).map(m => m[1]).sort();
}

function parsePlanIssueStatuses(planText) {
  const map = new Map();
  const regex = /^- (Step\d+-\d+) \[([^\]]+)\]:/gm;
  let match;
  while ((match = regex.exec(planText)) !== null) {
    map.set(match[1], match[2]);
  }
  return map;
}

function parsePlanRIds(planText) {
  return new Set(Array.from(planText.matchAll(/^- r(\d+) \/ /gm)).map(m => `r${m[1]}.md`));
}

function checkIssueLogs(planText) {
  const issueFiles = listFiles('docs/logs/issues', /^Step\d+-\d+\.md$/);
  const issueMeta = parseMetaDocumentLines('docs/logs/issues/meta.yaml', 'Step\\d+-\\d+\\.md');

  const missingInMeta = issueFiles.filter(file => !issueMeta.includes(file));
  const extraInMeta = issueMeta.filter(file => !issueFiles.includes(file));
  if (missingInMeta.length > 0) errors.push(`docs/logs/issues/meta.yaml missing: ${missingInMeta.join(', ')}`);
  if (extraInMeta.length > 0) errors.push(`docs/logs/issues/meta.yaml extra: ${extraInMeta.join(', ')}`);

  const planStatusMap = parsePlanIssueStatuses(planText);
  const requiredBaseHeaders = [
    'issue:',
    'development log:',
    'technical/architecture reason:',
    'cautions:',
    'troubles:',
    'r-issue:',
    'edited documents:',
    'next action:',
    'checklist:',
  ];
  const requiredStep5Headers = ['verification:', 'impact:', 'expert review:'];

  for (const file of issueFiles) {
    const rel = `docs/logs/issues/${file}`;
    const content = read(rel);

    const firstLine = content.split('\n')[0].trim();
    const issueMatch = firstLine.match(/^issue:\s+(Step(\d+)-(\d+))\s+\[([^\]]+)\]\s+.+$/);
    if (!issueMatch) {
      errors.push(`${rel}: invalid issue line format`);
      continue;
    }

    const stepId = issueMatch[1];
    const stepMajor = Number.parseInt(issueMatch[2], 10);
    const status = issueMatch[4];

    if (stepMajor >= 5) {
      for (const header of requiredBaseHeaders) {
        if (!hasHeader(content, header)) {
          errors.push(`${rel}: missing header \`${header}\``);
        }
      }
    }

    if (!planStatusMap.has(stepId)) {
      errors.push(`${rel}: ${stepId} not found in docs/process/PLAN.md`);
    } else if (planStatusMap.get(stepId) !== status) {
      errors.push(`${rel}: status mismatch (log=${status}, plan=${planStatusMap.get(stepId)})`);
    }

    if (stepMajor >= 5) {
      for (const header of requiredStep5Headers) {
        if (!hasHeader(content, header)) {
          errors.push(`${rel}: missing Step5+ header \`${header}\``);
        }
      }
    }

    const checklistLines = content.match(/^- \[(?: |x)\] .+$/gm) ?? [];
    if (checklistLines.length === 0) {
      errors.push(`${rel}: checklist items not found`);
      continue;
    }

    if (stepMajor >= 5) {
      const hasProcessCheckItem = checklistLines.some(line => line.includes('process-check executed locally'));
      if (!hasProcessCheckItem) {
        errors.push(`${rel}: missing checklist item \`process-check executed locally\``);
      }
    }

    if (stepMajor >= 5 && status.includes('resolved')) {
      const uncheckedWithoutReason = checklistLines.filter(line => {
        if (!line.startsWith('- [ ]')) return false;
        return !(/N\/A:|—|不要|理由/.test(line));
      });
      for (const line of uncheckedWithoutReason) {
        errors.push(`${rel}: unresolved checklist item without reason -> ${line}`);
      }
    }
  }
}

function checkRIssueLogs(planText) {
  const rFiles = listFiles('docs/logs/r_issues', /^r\d+\.md$/);
  const rMeta = parseMetaDocumentLines('docs/logs/r_issues/meta.yaml', 'r\\d+\\.md');

  const missingInMeta = rFiles.filter(file => !rMeta.includes(file));
  const extraInMeta = rMeta.filter(file => !rFiles.includes(file));
  if (missingInMeta.length > 0) errors.push(`docs/logs/r_issues/meta.yaml missing: ${missingInMeta.join(', ')}`);
  if (extraInMeta.length > 0) errors.push(`docs/logs/r_issues/meta.yaml extra: ${extraInMeta.join(', ')}`);

  const rPlanSet = parsePlanRIds(planText);
  for (const file of rFiles) {
    const rel = `docs/logs/r_issues/${file}`;
    const content = read(rel);
    const firstLine = content.split('\n')[0].trim();
    const headerMatch = firstLine.match(/^r-issue:\s+r(\d+)\s+\/.+$/);
    if (!headerMatch) {
      errors.push(`${rel}: invalid r-issue header format`);
      continue;
    }

    const id = Number.parseInt(headerMatch[1], 10);
    if (!rPlanSet.has(file)) {
      errors.push(`${rel}: not listed in docs/process/PLAN.md r-issue section`);
    }

    if (id >= 21) {
      const required = [
        'context:',
        'problem:',
        'impact:',
        'decision:',
        'plan:',
        'done criteria:',
        'evidence:',
        'status history:',
        'action:',
        'edited documents:',
      ];
      for (const header of required) {
        if (!hasHeader(content, header)) {
          errors.push(`${rel}: missing r21+ header \`${header}\``);
        }
      }

      if (!/^status history:\n- /m.test(content)) {
        errors.push(`${rel}: status history must include at least one bullet`);
      }
    }
  }
}

function main() {
  const planText = read('docs/process/PLAN.md');

  checkIssueLogs(planText);
  checkRIssueLogs(planText);

  if (warnings.length > 0) {
    console.log('process-check warnings:');
    for (const warning of warnings) console.log(`- ${warning}`);
  }

  if (errors.length > 0) {
    console.error('process-check failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log('process-check passed.');
}

main();
