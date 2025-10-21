import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer la versión del package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Leer el historial de versiones
const logsDir = path.join(__dirname, '..', 'logs');
const logFilePath = path.join(logsDir, 'version-history.json');

console.log('📋 Información de Versión Actual:');
console.log('================================');
console.log(`📦 Versión del package.json: ${packageJson.version}`);

if (fs.existsSync(logFilePath)) {
  const versionHistory = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
  const latestVersion = versionHistory[versionHistory.length - 1];
  
  console.log('\n Última Generación:');
  console.log(`    Fecha: ${latestVersion.date}`);
  console.log(`    Hora: ${latestVersion.time}`);
  console.log(`    Build: ${latestVersion.buildNumber}`);
  console.log(`    Entorno: ${latestVersion.environment}`);
  
  console.log('\n Historial de Versiones:');
  console.log('==========================');
  versionHistory.slice(-5).reverse().forEach((log, index) => {
    console.log(`${index + 1}. v${log.version} - ${log.date} ${log.time} (Build: ${log.buildNumber})`);
  });
  
  if (versionHistory.length > 5) {
    console.log(`   ... y ${versionHistory.length - 5} versiones más`);
  }
} else {
  console.log('\n⚠️  No se encontró historial de versiones.');
  console.log('   Ejecuta "npm run version:log" para crear el primer registro.');
}

// Verificar archivos de versión pública
const publicVersionPath = path.join(__dirname, '..', 'public', 'version.json');
const publicVersionTxtPath = path.join(__dirname, '..', 'public', 'version.txt');

console.log('\n Archivos de Versión Pública:');
if (fs.existsSync(publicVersionPath)) {
  console.log('   ✅ version.json - Disponible');
} else {
  console.log('   ❌ version.json - No encontrado');
}

if (fs.existsSync(publicVersionTxtPath)) {
  console.log('   ✅ version.txt - Disponible');
} else {
  console.log('   ❌ version.txt - No encontrado');
} 