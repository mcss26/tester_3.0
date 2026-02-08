const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '../pages');
const IGNORE_FILES = ['test-devenciones.html']; // Internal tools might use inline styles

function getHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getHtmlFiles(filePath));
        } else if (file.endsWith('.html')) {
            results.push(filePath);
        }
    });
    return results;
}

function auditFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    const fileName = path.basename(filePath);
    
    if (IGNORE_FILES.includes(fileName)) return [];

    const issues = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Check for style tag
        if (line.includes('<style')) {
            issues.push({
                file: relativePath,
                line: lineNum,
                type: '<style> tag detected',
                content: line.trim()
            });
        }

        // Check for inline style attribute
        // Regex looks for style="... not empty ..."
        const styleMatch = line.match(/style=["'](.*?)["']/);
        if (styleMatch && styleMatch[1].trim().length > 0) {
            // Filter out some common acceptable inline styles like dynamic widths in progress bars if strictly needed
            // But for now, we want to flag everything.
            issues.push({
                file: relativePath,
                line: lineNum,
                type: 'Inline style attribute',
                content: line.trim()
            });
        }
    });

    return issues;
}

function runAudit() {
    console.log('🔍 Starting CSS Hygiene Audit...');
    console.log('Target: ' + PAGES_DIR);
    console.log('---------------------------------------------------');

    const files = getHtmlFiles(PAGES_DIR);
    let totalIssues = 0;
    let filesWithIssues = 0;

    files.forEach(file => {
        const issues = auditFile(file);
        if (issues.length > 0) {
            filesWithIssues++;
            totalIssues += issues.length;
            console.log(`\n📄 ${path.relative(process.cwd(), file)}`);
            issues.forEach(issue => {
                console.log(`   ❌ Line ${issue.line}: ${issue.type}`);
                console.log(`      "${issue.content.substring(0, 80)}${issue.content.length > 80 ? '...' : ''}"`);
            });
        }
    });

    console.log('\n---------------------------------------------------');
    if (totalIssues === 0) {
        console.log('✅ CSS Hygiene Check Passed! No inline styles found.');
        process.exit(0);
    } else {
        console.log(`⚠️  Found ${totalIssues} issues in ${filesWithIssues} files.`);
        console.log('❌ CSS Hygiene Check Failed.');
        process.exit(1);
    }
}

runAudit();
