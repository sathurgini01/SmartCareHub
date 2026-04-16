const fs = require('fs');
const files = [
  'frontend/src/pages/Register.js',
  'frontend/src/pages/UploadReport.js',
  'frontend/src/pages/Profile.js',
  'frontend/src/pages/Prescriptions.js',
  'frontend/src/pages/Login.js',
  'frontend/src/pages/Home.js',
  'frontend/src/pages/Dashboard.js',
  'frontend/src/pages/Appointments.js',
  'frontend/src/components/Layout.js'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/contexts\/AuthContext/g, 'context/AuthContext');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
