const fs = require('fs');

const appPath = 'c:/Users/lenovo/Ujamaadash/Ujamaadash/src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

const lines = content.split('\n');

// Find start and end indices
const startIdx = lines.findIndex(l => l.includes('// ─── LOGIN PANEL'));
const endIdx = lines.findIndex(l => l.includes('const PAGE_LABELS: Record<string, string> = {'));

if (startIdx !== -1 && endIdx !== -1) {
    const newImports = [
        "import { LoginModal } from './components/LoginModal';",
        "import { SubmitReport } from './components/SubmitReport';",
        "import { TrainingsPage } from './components/TrainingsPage';",
        "import { ETTPage } from './components/ETTPage';",
        "import { UsersPage } from './components/UsersPage';"
    ];

    const newLines = [
        ...lines.slice(0, startIdx),
        ...newImports,
        "",
        ...lines.slice(endIdx)
    ];

    fs.writeFileSync(appPath, newLines.join('\n'), 'utf8');
    console.log('App.tsx refactored successfully.');
} else {
    console.error('Could not find start or end markers.');
}
