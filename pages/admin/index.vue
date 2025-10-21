<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <div v-else-if="shouldShowContent" class="flex-1 bg-background">
      <AdminHeader
        title="Herramientas de admin"
        currentScreen="admin"
        :showBackButton="true"
        :showNewReservationButton="true"
        :showMaterialButton="true"
        @goBack="goBack"
      />

      <div class="max-w-full lg:max-w-2xl mx-auto pt-12">
        <div
          class="m-4 space-y-0 border-1 border-secondary/12 rounded-2xl overflow-hidden"
        >
          <section v-for="item in menuItems" :key="item.to">
            <NuxtLink :to="item.to">
              <Card
                class="bg-secondary/5 border-0 border-b-1 border-secondary/12 shadow-none cursor-pointer hover:bg-secondary/20 transition-colors rounded-none py-1"
              >
                <CardContent class="flex items-center justify-between py-1 px-3">
                  <p class="text-sm font-medium">{{ item.title }}</p>
                  <Icon icon="weui:arrow-filled" width="20" height="20" />
                </CardContent>
              </Card>
            </NuxtLink>
          </section>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation con Footer -->
    <BottomNavigation :showReservationButton="true" @open-chat="handleOpenChat" />
  </div>
</template>

<script setup lang="ts">
import AdminHeader from "@/components/admin/AdminHeader.vue";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/vue";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

const menuItems = [
  {
    title: "Gestión de videos informativos",
    to: "/admin/videos",
  },
  {
    title: "Gestión de formularios y disponibilidad",
    to: "/admin/formularios",
  },
  {
    title: "Gestión de costos y promociones",
    to: "/admin/costos",
  },
  {
    title: "Gestión de roles y permisos",
    to: "/admin/roles",
  },
  {
    title: "Gestión de control de usuarios",
    to: "/admin/usuarios",
  },
];

const goBack = () => {
  history.back();
};

// Manejar apertura del chat
const handleOpenChat = () => {
  console.log("Abriendo chat...");
  // Aquí puedes implementar la lógica para abrir el chat
};
</script>
