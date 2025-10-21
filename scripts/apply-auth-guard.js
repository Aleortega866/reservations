#!/usr/bin/env node

/**
 * Script para aplicar Auth Guard a todas las páginas protegidas
 * Este script automatiza la aplicación del patrón de Auth Guard
 */

const fs = require('fs');
const path = require('path');

// Páginas que necesitan Auth Guard (excluyendo las públicas)
const protectedPages = [
  'pages/reservations/formulario-reservacion.vue',
  'pages/reservations/material-didactico.vue',
  'pages/material/index.vue',
  'pages/material/material-visita.vue',
  'pages/notification/index.vue',
  'pages/notifications/index.vue',
  'pages/notifications.vue',
  'pages/profile/contact-security.vue',
  'pages/profile/personal-data.vue',
  'pages/profile/reservation-data.vue',
  'pages/workshops/index.vue',
  // Páginas de admin
  'pages/admin/chatbot.vue',
  'pages/admin/costos.vue',
  'pages/admin/cursos.vue',
  'pages/admin/formularios.vue',
  'pages/admin/materiales.vue',
  'pages/admin/roles.vue',
  'pages/admin/usuarios.vue',
  'pages/admin/videos.vue'
];

// Patrón de template a aplicar
const authGuardTemplate = `
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />
    
    <!-- Contenido solo si está autenticado -->
    <div v-else-if="shouldShowContent" class="flex-1 bg-background">`;

// Imports a agregar
const authGuardImports = `
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";`;

// Composable a agregar
const authGuardComposable = `
// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();`;

function applyAuthGuardToFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si ya tiene Auth Guard aplicado
    if (content.includes('useAuthGuard') || content.includes('AuthLoading')) {
      console.log(`✅ Auth Guard ya aplicado en: ${filePath}`);
      return true;
    }

    // Aplicar transformaciones
    let modified = false;

    // 1. Agregar AuthLoading al template
    if (content.includes('<template>')) {
      const templateMatch = content.match(/<template>\s*<div[^>]*>/);
      if (templateMatch) {
        content = content.replace(
          templateMatch[0],
          templateMatch[0] + authGuardTemplate
        );
        modified = true;
      }
    }

    // 2. Agregar imports
    if (content.includes('import') && !content.includes('useAuthGuard')) {
      const lastImport = content.match(/import[^;]+;/g);
      if (lastImport) {
        const lastImportIndex = content.lastIndexOf(lastImport[lastImport.length - 1]);
        const insertIndex = lastImportIndex + lastImport[lastImport.length - 1].length;
        content = content.slice(0, insertIndex) + authGuardImports + content.slice(insertIndex);
        modified = true;
      }
    }

    // 3. Agregar composable
    if (content.includes('const ') && !content.includes('shouldShowLoading')) {
      const firstConst = content.match(/const\s+\w+/);
      if (firstConst) {
        const insertIndex = content.indexOf(firstConst[0]);
        content = content.slice(0, insertIndex) + authGuardComposable + '\n' + content.slice(insertIndex);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Auth Guard aplicado a: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  No se pudo aplicar Auth Guard a: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Ejecutar el script
console.log('🚀 Aplicando Auth Guard a páginas protegidas...\n');

let successCount = 0;
let totalCount = protectedPages.length;

protectedPages.forEach(pagePath => {
  const fullPath = path.join(process.cwd(), pagePath);
  if (applyAuthGuardToFile(fullPath)) {
    successCount++;
  }
});

console.log(`\n📊 Resultado: ${successCount}/${totalCount} páginas actualizadas`);
console.log('✅ Auth Guard aplicado exitosamente');
