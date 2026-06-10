const fs = require('fs');
const cheerio = require('cheerio');

function extractSessions(htmlPath, prefix) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);
  
  const sessions = [];
  
  $('.session-block').each((i, el) => {
    const $block = $(el);
    const titleText = $block.find('.session-title').text().trim();
    
    // Parse title "Session X: Title"
    const titleMatch = titleText.match(/Session\s+(\d+)[^\w]*(.*)/i);
    let num = `${prefix}${i + 1}`;
    let title = titleText;
    if (titleMatch) {
      num = `${prefix}${titleMatch[1]}`;
      title = titleMatch[2].trim();
    }
    
    const contentBlocks = [];
    
    $block.children().each((j, child) => {
      const $c = $(child);
      if ($c.hasClass('session-title')) return; // skip title
      
      const text = $c.text().trim();
      if (!text) return;

      if ($c.is('p') || $c.is('h3') || $c.is('h4')) {
        let content = $c.html() || text;
        // simple conversion of strong
        content = content.replace(/<strong>/g, '**').replace(/<\/strong>/g, '**');
        content = content.replace(/<em>/g, '*').replace(/<\/em>/g, '*');
        contentBlocks.push({
          type: 'paragraph',
          content: content.replace(/<[^>]+>/g, '') // strip other tags
        });
      } else if ($c.is('ul') || $c.is('ol')) {
        const items = [];
        $c.find('li').each((k, li) => {
          items.push($(li).text().trim());
        });
        contentBlocks.push({
          type: 'paragraph',
          items: items
        });
      } else if ($c.hasClass('trainer-say')) {
        contentBlocks.push({
          type: 'trainer_says',
          content: text.replace(/^Trainer Says:\s*/i, '').replace(/^Trainer Asks:\s*/i, '').replace(/^Facilitator Says:\s*/i, '')
        });
      } else if ($c.hasClass('activity-box')) {
        const actLabel = $c.find('.act-label').text().trim();
        const items = [];
        let pText = "";
        $c.find('p, ul, ol, .trainer-say, .scenario-box').each((k, el) => {
          const $el = $(el);
          if ($el.is('ul') || $el.is('ol')) {
             $el.find('li').each((l, li) => items.push('- ' + $(li).text().trim()));
          } else if ($el.hasClass('scenario-box')) {
             items.push('Scenario: ' + $el.text().trim());
          } else if ($el.hasClass('trainer-say')) {
             items.push('Trainer: ' + $el.text().trim());
          } else {
             pText += $el.text().trim() + "\n";
          }
        });
        contentBlocks.push({
          type: 'activity',
          title: actLabel,
          content: pText.trim(),
          items: items.length > 0 ? items : undefined
        });
      } else if ($c.hasClass('definition-box')) {
        contentBlocks.push({
          type: 'definition',
          title: $c.find('.def-word').text().trim(),
          content: $c.find('.def-sub').text().trim()
        });
      } else if ($c.hasClass('tip-box')) {
        contentBlocks.push({
          type: 'tip',
          content: text
        });
      } else if ($c.hasClass('table-wrap')) {
        const headers = [];
        $c.find('th').each((k, th) => headers.push($(th).text().trim()));
        const rows = [];
        $c.find('tbody tr').each((k, tr) => {
           const row = [];
           $(tr).find('td').each((l, td) => row.push($(td).text().trim()));
           rows.push(row);
        });
        contentBlocks.push({
          type: 'table',
          headers,
          rows
        });
      } else if ($c.hasClass('values-grid')) {
        const columns = [];
        $c.find('.val-card').each((k, card) => {
           const items = [];
           $(card).find('li').each((l, li) => items.push($(li).text().trim()));
           columns.push({
             title: $(card).find('h4').text().trim(),
             items
           });
        });
        contentBlocks.push({
          type: 'values_grid',
          columns
        });
      } else if ($c.hasClass('pledge-box')) {
        contentBlocks.push({
          type: 'pledge',
          content: $c.find('p').text().trim().replace(/\n/g, ' ')
        });
      } else if ($c.hasClass('helpline-box')) {
        contentBlocks.push({
          type: 'helpline',
          title: $c.find('.hl-title').text().trim(),
          content: text.replace($c.find('.hl-title').text().trim(), '').trim()
        });
      } else if ($c.hasClass('step-grid')) {
        const steps = [];
        $c.find('.step-item').each((k, step) => steps.push($(step).text().trim().replace(/^\d+\s*/, '')));
        contentBlocks.push({
          type: 'step_grid',
          steps
        });
      }
    });
    
    sessions.push({
      num: num,
      title: title,
      dur: "1 hr",
      desc: title,
      pledge: null,
      objectives: [],
      content: contentBlocks
    });
  });
  
  return sessions;
}

const himSessions = extractSessions('./public/HIM.html', 'HIM');
const gesdSessions = extractSessions('./public/GESD.html', 'GESD');

let dataTs = fs.readFileSync('./src/data.ts', 'utf-8');

// Using string manipulation to ensure correct boundaries
function replaceArray(data, arrayName, newItems) {
  const marker = `export const ${arrayName}: Session[] = [`;
  const startIndex = data.indexOf(marker);
  if (startIndex === -1) throw new Error("Could not find " + arrayName);
  
  let openBrackets = 0;
  let endIndex = -1;
  let inString = false;
  let stringChar = '';
  
  for (let i = startIndex + `export const ${arrayName}: Session[] = `.length; i < data.length; i++) {
    const char = data[i];
    
    // very naive string parser, but adequate for our TS file
    if (inString) {
      if (char === stringChar && data[i-1] !== '\\') {
        inString = false;
      }
      continue;
    }
    if (char === '"' || char === "'" || char === '\`') {
      inString = true;
      stringChar = char;
      continue;
    }
    
    if (char === '[') openBrackets++;
    if (char === ']') openBrackets--;
    
    if (openBrackets === 0) {
      endIndex = i + 1; // include the ']'
      // include the following ';' if it exists
      if (data[endIndex] === ';') {
        endIndex++;
      }
      break;
    }
  }
  
  if (endIndex === -1) throw new Error("Could not find end of " + arrayName);
  
  const before = data.substring(0, startIndex);
  const after = data.substring(endIndex);
  return before + `export const ${arrayName}: Session[] = ${JSON.stringify(newItems, null, 2)};` + after;
}

dataTs = replaceArray(dataTs, 'HIM_SESSIONS', himSessions);
dataTs = replaceArray(dataTs, 'GESD_SESSIONS', gesdSessions);

fs.writeFileSync('./src/data.ts', dataTs, 'utf-8');
console.log('Successfully updated src/data.ts with parsed sessions!');
