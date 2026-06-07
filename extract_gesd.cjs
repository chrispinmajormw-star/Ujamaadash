const fs = require('fs');

function htmlToText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractGesdSessions() {
  const html = fs.readFileSync('./public/GESD.html', 'utf-8');
  const allsessMatch = html.match(/<div style="display:none" id="allsess">([\s\S]*?)<\/div>\s*<script>/);
  if (!allsessMatch) throw new Error('Could not find allsess block in GESD.html');
  const block = allsessMatch[1];

  const sessions = [];
  const sessionParts = block.split(/(?=<div id="sd\d+")/);

  for (const part of sessionParts) {
    const headerMatch = part.match(/^<div id="sd(\d+)"[^>]*data-title="([^"]*)"[^>]*data-topics="([^"]*)"[^>]*>/);
    if (!headerMatch) continue;

    const [, num, titleFull, topics] = headerMatch;
    const contentHtml = part.slice(headerMatch[0].length).replace(/<\/div>\s*$/, '');
    const titleMatch = titleFull.match(/Session\s+\d+[:\s-]+(.*)/i);
    const title = titleMatch ? titleMatch[1].trim() : titleFull;

    const objectives = [];
    const content = [];
    const cbRegex = /<div class="cb"><h3[^>]*data-h="([^"]*)"[^>]*>[^<]*<\/h3><p>([\s\S]*?)<\/p><\/div>/g;
    let cbMatch;

    while ((cbMatch = cbRegex.exec(contentHtml)) !== null) {
      const [, heading, pHtml] = cbMatch;
      const text = htmlToText(pHtml);
      if (heading.toLowerCase().includes('learning objective')) {
        text.split('\n').forEach(line => {
          const t = line.trim();
          if (t) objectives.push(t);
        });
      } else {
        content.push({ type: 'paragraph', title: heading, content: text });
      }
    }

    sessions.push({
      num: `GESD${num}`,
      title,
      dur: '45–60 min',
      desc: topics,
      pledge: null,
      objectives,
      content,
    });
  }

  return sessions;
}

function replaceArray(data, arrayName, newItems) {
  const marker = `export const ${arrayName}: Session[] = [`;
  const startIndex = data.indexOf(marker);
  if (startIndex === -1) throw new Error('Could not find ' + arrayName);

  let openBrackets = 0;
  let endIndex = -1;
  let inString = false;
  let stringChar = '';

  for (let i = startIndex + `export const ${arrayName}: Session[] = `.length; i < data.length; i++) {
    const char = data[i];
    if (inString) {
      if (char === stringChar && data[i - 1] !== '\\') inString = false;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      stringChar = char;
      continue;
    }
    if (char === '[') openBrackets++;
    if (char === ']') openBrackets--;
    if (openBrackets === 0) {
      endIndex = i + 1;
      if (data[endIndex] === ';') endIndex++;
      break;
    }
  }

  if (endIndex === -1) throw new Error('Could not find end of ' + arrayName);
  return data.substring(0, startIndex) + `export const ${arrayName}: Session[] = ${JSON.stringify(newItems, null, 2)};` + data.substring(endIndex);
}

const gesdSessions = extractGesdSessions();
console.log(`Extracted ${gesdSessions.length} GESD sessions:`, gesdSessions.map(s => s.num + ' - ' + s.title).join(', '));

let dataTs = fs.readFileSync('./src/data.ts', 'utf-8');
dataTs = replaceArray(dataTs, 'GESD_SESSIONS', gesdSessions);
fs.writeFileSync('./src/data.ts', dataTs, 'utf-8');
console.log('Updated GESD_SESSIONS in src/data.ts');
