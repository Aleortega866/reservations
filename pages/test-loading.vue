<template>
  <div class="container mx-auto p-8 space-y-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-2">Prueba de AppLoading</h1>
      <p class="text-gray-600 mb-8">
        Prueba el componente de loading global con diferentes configuraciones
      </p>

      <!-- Tarjetas de ejemplo -->
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Ejemplo 1: Loading básico -->
        <div class="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold mb-3">Loading Básico</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Muestra el loading con todos los elementos por defecto
          </p>
          <button
            @click="testBasicLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Probar Loading Básico
          </button>
        </div>

        <!-- Ejemplo 2: Loading con texto personalizado -->
        <div class="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold mb-3">Texto Personalizado</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Loading con mensaje personalizado
          </p>
          <button
            @click="testCustomTextLoading"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Probar Texto Custom
          </button>
        </div>

        <!-- Ejemplo 3: Solo logo -->
        <div class="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold mb-3">Solo Logo</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Muestra únicamente el logo con animación
          </p>
          <button
            @click="testLogoOnly"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Probar Solo Logo
          </button>
        </div>

        <!-- Ejemplo 4: Con withLoading -->
        <div class="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold mb-3">Helper withLoading</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Usa el helper para procesos async
          </p>
          <button
            @click="testWithLoading"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Probar withLoading
          </button>
        </div>

        <!-- Ejemplo 5: Proceso largo -->
        <div class="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold mb-3">Proceso Largo</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Simula un proceso de varios pasos
          </p>
          <button
            @click="testLongProcess"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Probar Proceso Largo
          </button>
        </div>

        <!-- Ejemplo 6: Sin spinner -->
        <div class="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold mb-3">Sin Spinner</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Loading sin los puntos animados
          </p>
          <button
            @click="testNoSpinner"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Probar Sin Spinner
          </button>
        </div>
      </div>

      <!-- Info del estado actual -->
      <div class="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 class="text-lg font-semibold mb-3">Estado Actual del Loading</h3>
        <div class="grid gap-2 text-sm font-mono">
          <div>
            <span class="font-bold">isLoading:</span>
            <span :class="isLoading ? 'text-green-600' : 'text-red-600'">
              {{ isLoading }}
            </span>
          </div>
          <div>
            <span class="font-bold">loadingText:</span>
            <span class="text-blue-600">{{ loadingText }}</span>
          </div>
          <div>
            <span class="font-bold">showText:</span>
            <span :class="showText ? 'text-green-600' : 'text-red-600'">
              {{ showText }}
            </span>
          </div>
          <div>
            <span class="font-bold">showSpinner:</span>
            <span :class="showSpinner ? 'text-green-600' : 'text-red-600'">
              {{ showSpinner }}
            </span>
          </div>
        </div>
      </div>

      <!-- Código de ejemplo -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold mb-3">Código de Ejemplo</h3>
        <pre
          class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm"
        ><code>// Importar el composable
const { showLoading, hideLoading, withLoading } = useAppLoading()

// Uso básico
showLoading('Cargando datos...')
await fetchData()
hideLoading()

// Con helper
await withLoading(
  async () => {
    await fetchData()
  },
  'Procesando...'
)</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppLoading } from "@/composables/ui/useAppLoading";

const {
  showLoading,
  hideLoading,
  withLoading,
  isLoading,
  loadingText,
  showText,
  showSpinner,
} = useAppLoading();

// Función helper para simular delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Ejemplo 1: Loading básico
const testBasicLoading = async () => {
  showLoading();
  await delay(3000);
  hideLoading();
};

// Ejemplo 2: Loading con texto personalizado
const testCustomTextLoading = async () => {
  showLoading("Procesando tu solicitud...");
  await delay(3000);
  hideLoading();
};

// Ejemplo 3: Solo logo
const testLogoOnly = async () => {
  showLoading("", {
    showText: false,
    showSpinner: false,
  });
  await delay(3000);
  hideLoading();
};

// Ejemplo 4: Con withLoading
const testWithLoading = async () => {
  await withLoading(async () => {
    await delay(3000);
  }, "Ejecutando proceso async...");
};

// Ejemplo 5: Proceso largo con múltiples pasos
const testLongProcess = async () => {
  showLoading("Paso 1: Validando datos...");
  await delay(1500);

  showLoading("Paso 2: Procesando información...");
  await delay(1500);

  showLoading("Paso 3: Guardando cambios...");
  await delay(1500);

  showLoading("Paso 4: Finalizando...");
  await delay(1500);

  hideLoading();
};

// Ejemplo 6: Sin spinner
const testNoSpinner = async () => {
  showLoading("Cargando sin spinner...", {
    showSpinner: false,
  });
  await delay(3000);
  hideLoading();
};
</script>
