<template>
  <div class="max-w-full">
    <DesktopNavigation title="Notificaciones" :showBackButton="true" @goBack="goBack" />

    <NotificationList :notifications="notifications" />
  </div>
</template>

<script setup lang="ts">
import NotificationList from "@/components/notifications/NotificationList.vue";
import { ref } from "vue";
import { useAutoStoreCleanup } from "@/composables/utils/useAutoStoreCleanup";
import DesktopNavigation from "@/components/app/DesktopNavigation.vue";
import { useRouter } from "vue-router";

const router = useRouter();
// Limpieza automática de stores de reservaciones al entrar a notificaciones
useAutoStoreCleanup({
  cleanupRoutes: ["/reservations", "/notifications"],
  preserveOnRoutes: ["/reservations/formulario-reservacion"],
});

const notifications = ref([
  {
    type: "form",
    title: "Completa todos los datos del formulario",
    description: "Debes completar todos los datos para apartar tu lugar de visita",
    timeAgo: "Hace 5 minutos",
  },
  {
    type: "pending",
    title: "Tienes una reservación por confirmar",
    description:
      'Confirma la visita de "Instituto Canadiense Clarac" para no perder tu lugar.',
    timeAgo: "Hace 10 minutos",
  },
  {
    type: "confirmed",
    title: "Reservación confirmada",
    description:
      "Recuerda que puedes consultar el material didáctico las veces que quieras.",
    timeAgo: "Hace 1 hora",
  },
  {
    type: "comment",
    title: "Te han respondido un comentario",
    description: "Puedes agregar el número de asistentes que desees en el comentario.",
    timeAgo: "Hace 2 horas",
  },
  {
    type: "status",
    title: "Una reservación ha cambiado de estatus",
    description: "Reservación Pausada",
    inactive: true,
    timeAgo: "Hace 1 día",
  },
  {
    type: "comment",
    title: "Te han respondido un comentario",
    description: "Puedes agregar el número de asistentes que desees en el comentario.",
    inactive: true,
    timeAgo: "Hace 2 días",
  },
  {
    type: "pending",
    title: "Tienes una reservación por confirmar",
    description:
      'Confirma la visita de "Instituto Canadiense Clarac" para no perder tu lugar.',
    inactive: true,
    timeAgo: "Hace 3 días",
  },
]);

const goBack = () => {
  router.push("/reservations");
};
</script>

<style scoped>
.material-icons {
  font-family: "Material Icons";
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}
</style>
