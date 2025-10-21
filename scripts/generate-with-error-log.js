#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para obtener timestamp
function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

// Función para crear el directorio de logs si no existe
function ensureLogsDirectory() {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  return logsDir;
}

// Función para escribir el log de errores
function writeErrorLog(errorOutput, logsDir) {
  const timestamp = getTimestamp();
  const errorLogFile = path.join(logsDir, `generate-errors-${timestamp}.log`);
  
  const logContent = `
========================================
ERROR LOG - GENERATE COMMAND
========================================
Timestamp: ${new Date().toISOString()}
Command: npm run generate
Working Directory: ${process.cwd()}
Node Version: ${process.version}
NPM Version: ${process.env.npm_version || 'Unknown'}

========================================
ERROR OUTPUT:
========================================
${errorOutput}

========================================
END OF ERROR LOG
========================================
`;

  fs.writeFileSync(errorLogFile, logContent, 'utf8');
  console.log(`\n❌ Errores guardados en: ${errorLogFile}`);
  return errorLogFile;
}

// Función principal
async function runGenerateWithErrorLog() {
  console.log('🚀 Iniciando proceso de generate con captura de errores...\n');
  
  const logsDir = ensureLogsDirectory();
  let errorOutput = '';
  let hasErrors = false;

  return new Promise((resolve, reject) => {
    // Ejecutar el comando generate
    const generateProcess = spawn('npm', ['run', 'generate'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
      cwd: process.cwd()
    });

    // Capturar stdout
    generateProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);
      
      // Detectar errores en la salida estándar
      if (output.includes('ERROR') || output.includes('Error') || output.includes('error')) {
        errorOutput += `STDOUT: ${output}\n`;
        hasErrors = true;
      }
    });

    // Capturar stderr
    generateProcess.stderr.on('data', (data) => {
      const output = data.toString();
      process.stderr.write(output);
      errorOutput += `STDERR: ${output}\n`;
      hasErrors = true;
    });

    // Manejar el final del proceso
    generateProcess.on('close', (code) => {
      console.log(`\n📊 Proceso terminado con código: ${code}`);
      
      if (code !== 0 || hasErrors) {
        console.log('\n❌ Se detectaron errores durante el generate');
        
        if (errorOutput.trim()) {
          const errorLogFile = writeErrorLog(errorOutput, logsDir);
          console.log(`\n📝 Log de errores creado: ${errorLogFile}`);
        } else {
          console.log('\n⚠️  No se capturó output de errores, pero el proceso falló');
        }
        
        reject(new Error(`Generate falló con código ${code}`));
      } else {
        console.log('\n✅ Generate completado exitosamente sin errores');
        resolve();
      }
    });

    // Manejar errores del proceso
    generateProcess.on('error', (error) => {
      console.error('\n❌ Error al ejecutar el proceso:', error.message);
      errorOutput += `PROCESS ERROR: ${error.message}\n`;
      
      const errorLogFile = writeErrorLog(errorOutput, logsDir);
      console.log(`\n📝 Log de errores creado: ${errorLogFile}`);
      
      reject(error);
    });
  });
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runGenerateWithErrorLog()
    .then(() => {
      console.log('\n🎉 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Proceso falló:', error.message);
      process.exit(1);
    });
}

export { runGenerateWithErrorLog };
