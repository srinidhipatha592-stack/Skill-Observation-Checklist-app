const fs = require('fs');
const path = require('path');
const pagesDir = 'src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx') && f !== 'Login.jsx');

files.forEach(f => {
  const filePath = path.join(pagesDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('import Sidebar')) {
    // Add import
    content = content.replace(/(import .*;\n)/, `$1import Sidebar from "../components/Sidebar";\n`);
    
    // Wrap return
    content = content.replace(/return\s*\(\s*(<div[^>]*marginLeft[^>]*>)/m, `return (\n    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>\n      <Sidebar />\n      $1`);
    
    // Add closing div
    content = content.replace(/(<\/div>\s*)\);\s*}\s*$/m, `$1  </div>\n);\n}`);
    
    fs.writeFileSync(filePath, content);
    console.log('Added Sidebar to', f);
  }
});
