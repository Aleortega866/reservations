<template>
  <div
    class="m-4 p-0 space-y-0 border-2 border-b-0 border-secondary/15 rounded-2xl overflow-hidden shadow-lg"
  >
    <section v-for="item in menuItems" :key="item.key">
      <Card
        @click="$emit('navigate', item.key)"
        class="bg-secondary/5 border-0 border-b-2 border-secondary/15 shadow-none cursor-pointer hover:bg-secondary/20 transition-colors rounded-none pt-1 pb-1"
      >
        <CardContent class="flex items-center justify-between py-1 px-3">
          <p class="text-sm font-medium">{{ item.title }}</p>
          <Icon icon="weui:arrow-filled" width="25" height="25" />
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/vue";

const menuItems = [
  {
    title: "Detalles de perfil",
    key: "personal-data",
  },
  {
    title: "Contacto y seguridad",
    key: "contact-security",
  },
  {
    title: "Datos de reservaciones",
    key: "reservations-data",
  },
];

defineEmits(["navigate"]);
</script>
