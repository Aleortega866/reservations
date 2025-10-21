<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <AdminHeader title="Gestión de materiales CAD" showBackButton showMoreButton @goBack="goBack" />
      <h2 class="text-lg font-bold mb-4">Gestión de materiales CAD</h2>
      <p>Contenido en construcción...</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import AdminHeader from '@/components/admin/AdminHeader.vue';
import { useAuthGuard } from '@/composables/auth/useAuthGuard';
import AuthLoading from '@/components/auth/AuthLoading.vue';

const router = useRouter();

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

const goBack = () => {
  router.back();
};

// Aquí puedes agregar lógica futura
</script> 