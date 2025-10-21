<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-background border-b border-gray-200">
      <div class="flex items-center px-4 py-4">
        <button @click="goBack" class="mr-4">
          <Icon icon="mdi:arrow-left" width="24" height="24" class="text-gray-700" />
        </button>
        <h1 class="text-xl font-semibold">Información Legal</h1>
      </div>
    </div>

    <!-- Contenido -->
    <div class="max-w-4xl mx-auto px-4 py-6 flex-1">
      <!-- Información Legal -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-green-600 mb-4">Información Legal</h2>
        <p class="text-sm text-gray-700 leading-relaxed mb-4">
          El FIDEICOMISO DEL ESPACIO CULTURAL Y EDUCATIVO BETLEMITAS/ MUSEO INTERACTIVO DE
          ECONOMÍA (FECEB/MIDE), es una institución educativa y cultural sin fines de
          lucro, con domicilio en la calle de Tacuba N° 17 Colonia Centro Alcaldía
          Cuauhtémoc C.P. 06000 Ciudad de México.
        </p>
        <p class="text-sm text-gray-700 leading-relaxed">
          En nuestro carácter de responsables en el tratamiento de sus datos personales,
          comunicamos que la información de nuestros USUARIOS es tratada de forma
          estrictamente confidencial.
        </p>
      </section>

      <!-- Política de Cookies -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-blue-600 mb-4">Política de Cookies</h2>
        <p class="text-sm text-gray-700 leading-relaxed">
          Utilizamos cookies para mejorar su experiencia de navegación en nuestro sitio
          web. Las cookies son pequeños archivos de texto que se almacenan en su
          dispositivo cuando visita nuestro sitio web. Las cookies nos ayudan a recordar
          sus preferencias y ajustes, para que no tenga que volver a ingresar su
          información cada vez que visite nuestro sitio web. Puede configurar su navegador
          para que rechace todas las cookies, pero tenga en cuenta que esto puede afectar
          negativamente a algunas funciones de nuestro sitio web.
        </p>
      </section>

      <!-- Seguridad de los datos personales -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-blue-600 mb-4">
          Seguridad de los datos personales
        </h2>
        <p class="text-sm text-gray-700 leading-relaxed">
          Con el fin de evitar el acceso no autorizado a sus datos personales y a efecto
          de asegurar que la información sea utilizada para los fines establecidos en este
          aviso de privacidad, hemos implementado un procedimiento para impedir el uso o
          divulgación no autorizada de sus datos, permitiéndonos tratarlos debidamente.
        </p>
      </section>

      <!-- Aviso de Privacidad -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-blue-600 mb-4">Aviso de Privacidad</h2>
        <p class="text-sm text-gray-700 leading-relaxed mb-4">
          Para conocer nuestro aviso de privacidad completo, puede consultarlo en el
          siguiente enlace:
        </p>
        <a
          href="https://www.mide.org.mx/aviso-de-privacidad"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-primary hover:underline font-medium"
        >
          www.mide.org.mx/aviso-de-privacidad
        </a>
      </section>

      <!-- Términos y Condiciones -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-blue-600 mb-4">Términos y Condiciones</h2>
        <p class="text-sm text-gray-700 leading-relaxed">
          Al utilizar nuestros servicios, usted acepta cumplir con nuestros términos y
          condiciones. Por favor, lea cuidadosamente nuestros términos antes de realizar
          cualquier reservación o utilizar nuestros servicios.
        </p>
      </section>

      <!-- Contacto -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-blue-600 mb-4">Contacto</h2>
        <p class="text-sm text-gray-700 leading-relaxed mb-2">
          Si tiene alguna pregunta sobre nuestra política de privacidad o sobre cómo
          manejamos sus datos personales, puede contactarnos:
        </p>
        <ul class="text-sm text-gray-700 leading-relaxed list-disc list-inside ml-4">
          <li>Correo electrónico: contacto@mide.org.mx</li>
          <li>Teléfono: (55) 5130-4600</li>
          <li>Dirección: Tacuba N° 17, Colonia Centro, C.P. 06000, CDMX</li>
        </ul>
      </section>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation :showReservationButton="false" @open-chat="handleOpenChat" />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";

const router = useRouter();

const goBack = () => {
  router.back();
};

const handleOpenChat = () => {
  console.log("Abriendo chat...");
  // Aquí puedes implementar la lógica para abrir el chat
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
