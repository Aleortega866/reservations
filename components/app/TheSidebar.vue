<script setup lang="ts">
import { ref, watchEffect } from "vue";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/ui/useToast";
import { Icon } from "@iconify/vue";

const { toggleSidebar } = useSidebar();
const authStore = useAuthStore();
const { showSuccess, showInfo } = useToast();

// Menu items base
const baseItems = [
  {
    title: "Notificaciones",
    url: "/notification",
    icon: "mdi:bell-outline",
  },
  {
    title: "Reservaciones",
    url: "/reservations",
    icon: "mdi:calendar-outline",
  },
  {
    title: "Mi Perfil",
    url: "/profile",
    icon: "mdi:account-cog-outline",
  },
  {
    title: "Crear Nueva Reservación",
    url: "/reservations/formulario-reservacion",
    icon: "ic:outline-perm-media",
  },
  {
    title: "Material Didáctico",
    url: "/material",
    icon: "ic:outline-perm-media",
  },
  {
    title: "Chat",
    url: "/contact",
    icon: "material-symbols:chat-outline",
  },
  {
    title: "FAQ's",
    url: "/faqs",
    icon: "tdesign:chat-bubble-help",
  },
];

// Item de admin (solo visible para administradores)
const adminItem = {
  title: "Herramientas de admin",
  url: "/admin",
  icon: "fluent:settings-cog-multiple-20-filled",
};

// Items del menú basado en el rol del usuario
const items = ref([...baseItems]);

// Actualizar items cuando cambie el rol del usuario
watchEffect(() => {
  const menuItems = [...baseItems];

  // Solo agregar el item de admin si el usuario es Admin o SuperAdmin
  if (authStore.isAdmin) {
    // Insertar el item de admin después de "Crear Nueva Reservación"
    const insertIndex = 4;
    menuItems.splice(insertIndex, 0, adminItem);
  }

  items.value = menuItems;
});

// Función para manejar el logout
const handleLogout = async () => {
  try {
    // Toast informativo
    showInfo("Cerrando sesión", "Te estamos desconectando...");

    // Ejecutar logout
    authStore.logout();

    // Toast de éxito
    showSuccess("Sesión cerrada", "Has cerrado sesión exitosamente");

    // Cerrar el sidebar
    toggleSidebar();

    // Redirigir al login después de un breve delay

    window.location.href = "/auth/login";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
</script>

<template>
  <Sidebar side="right" class="bg-white !z-[999]">
    <SidebarHeader class="p-0">
      <div class="grid grid-cols-3 items-center justify-end px-3 pt-10 pb-2">
        <div></div>
        <img src="/assets/logo-header.svg" alt="logo" class="w-20 h-auto" />
        <div class="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            class="w-6 h-6 bg-primary text-white rounded-full"
            @click="toggleSidebar"
          >
            <Icon icon="lucide:more-horizontal" width="24" height="24" />
          </Button>
        </div>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu class="space-y-5 overflow-auto max-h-[calc(100vh-10rem)] pt-8">
            <Button
              size="icon"
              class="w-full rounded-full font-normal"
              @click="toggleSidebar"
            >
              <Icon
                icon="material-symbols:calendar-add-on-outline"
                class="mb-0 mr-0"
                style="color: #fff; width: 24px; height: 24px"
              />

              Crear nueva reservación
            </Button>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton asChild>
                <a
                  :href="item.url"
                  class="min-h-12 flex items-center justify-start gap-2 w-full"
                >
                  <div
                    class="min-w-10 flex items-center justify-center min-h-10 bg-foreground rounded-full text-white text-xs italic p-1"
                  >
                    <Icon :icon="item.icon" style="width: 20px; height: 20px" />
                  </div>

                  <span class="font-medium italic w-full">{{ item.title }}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <div class="absolute bg-white bottom-5 w-full">
        <!-- Separador antes del botón de logout -->
        <div class="border-t my-2"></div>

        <!-- Botón de cerrar sesión -->
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  @click="handleLogout"
                  class="text-primary hover:text-muted-foreground hover:bg-red-50"
                >
                  <Icon
                    icon="material-symbols:logout"
                    class="text-primary"
                    style="width: 24px; height: 24px"
                  />

                  <span class="w-full font-bold italic">Cerrar Sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
    </SidebarContent>
  </Sidebar>
</template>
