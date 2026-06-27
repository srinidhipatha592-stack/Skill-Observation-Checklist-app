const fs = require('fs');
const files = ['src/pages/UserManagement.jsx', 'src/pages/ObservationTrends.jsx', 'src/pages/EmailReports.jsx'];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\\n/g, '\n');
  fs.writeFileSync(f, content);
});
