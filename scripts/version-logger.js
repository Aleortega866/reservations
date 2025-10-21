import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer la versión del package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Crear el registro de versión
const timestamp = new Date().toISOString();
const versionLog = {
  version,
  timestamp,
  date: new Date().toLocaleDateString('es-ES'),
  time: new Date().toLocaleTimeString('es-ES'),
  buildNumber: generateBuildNumber(),
  environment: process.env.NODE_ENV || 'development'
};

// Función para generar número de build
function generateBuildNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}`;
}

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Guardar en archivo de logs
const logFilePath = path.join(logsDir, 'version-history.json');
let versionHistory = [];

if (fs.existsSync(logFilePath)) {
  versionHistory = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
}

versionHistory.push(versionLog);
fs.writeFileSync(logFilePath, JSON.stringify(versionHistory, null, 2));

// Crear archivo de versión actual
const currentVersionPath = path.join(__dirname, '..', 'public', 'version.json');
const publicDir = path.dirname(currentVersionPath);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(currentVersionPath, JSON.stringify(versionLog, null, 2));

// Crear archivo de versión para el cliente
const clientVersionPath = path.join(__dirname, '..', 'public', 'version.txt');
const versionText = `Versión: ${version}\nFecha: ${versionLog.date}\nHora: ${versionLog.time}\nBuild: ${versionLog.buildNumber}`;
fs.writeFileSync(clientVersionPath, versionText);

console.log('Versión registrada exitosamente:');
console.log(`Versión: ${version}`);
console.log(`Fecha: ${versionLog.date}`);
console.log(`Hora: ${versionLog.time}`);
console.log(`Build: ${versionLog.buildNumber}`);
console.log(`Logs guardados en: ${logFilePath}`);
console.log(`Versión pública en: ${currentVersionPath}`); 