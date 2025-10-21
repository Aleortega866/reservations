<template>
  <div class="flex flex-col divide-y divide-gray-100 space-y-2 py-2 px-1 overflow-hidden">
    <NotificationItem
      v-for="(n, i) in notifications"
      :key="i"
      :type="n.type"
      :title="n.title"
      :description="n.description"
      :inactive="n.inactive || false"
      :timeAgo="n.timeAgo || 'Hace 14 minutos'"
      :notificationId="n.notificationId"
      :reservationId="n.reservationId"
      :style="{ '--animation-delay': `${i * 100}ms` }"
      class="py-2"
      @markAsRead="$emit('markAsRead', $event)"
      @delete="$emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import NotificationItem from "./NotificationItem.vue";
import { defineProps } from "vue";

interface Notification {
  type: string;
  title: string;
  description: string;
  inactive?: boolean;
  timeAgo?: string;
  notificationId?: number;
  reservationId?: number;
}

defineProps<{ notifications: Notification[] }>();

const emit = defineEmits(["markAsRead", "delete"]);
</script>
