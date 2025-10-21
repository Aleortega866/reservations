<template>
  <Transition
    appear
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 translate-x-4 scale-95"
    enter-to-class="opacity-100 translate-x-0 scale-100"
    :duration="isInactive ? 0 : 500"
    :style="{ 'animation-delay': isInactive ? '0ms' : 'var(--animation-delay, 0ms)' }"
  >
    <div
      :class="[
        'flex items-start gap-3 p-3 rounded-lg overflow-hidden',
        isInactive ? 'opacity-40' : 'bg-white',
        !isInactive ? 'animate-pulse-once' : '',
      ]"
    >
      <Icon
        :icon="notificationIcon"
        width="24"
        height="24"
        class="mt-1 flex-shrink-0"
        :class="iconColor"
      />
      <div class="flex-1 min-w-0">
        <span class="text-xs font-bold" :class="timeAgoColor">{{ timeAgo }}</span>
        <div class="font-semibold text-sm truncate" :class="titleColor">{{ title }}</div>
        <div class="text-xs truncate" :class="descriptionColor">{{ description }}</div>

        <!-- Action buttons for unread notifications -->
        <div v-if="!inactive && notificationId" class="mt-2 flex gap-2">
          <button
            @click="handleMarkAsRead"
            class="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
          >
            ✓ Marcar Leída
          </button>
          <button
            @click="handleDelete"
            class="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  type: {
    type: String,
    default: "info",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  inactive: {
    type: Boolean,
    default: false,
  },
  timeAgo: {
    type: String,
    default: "Hace 14 minutos",
  },
  notificationId: {
    type: Number,
    default: null,
  },
  reservationId: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["markAsRead", "delete"]);

const notificationIcon = computed(() => {
  // If notification is inactive (viewed), use outline icon
  if (props.inactive) {
    return "material-symbols:notifications-outline";
  }
  // If notification is active (not viewed), use active outline icon
  return "material-symbols:notifications-active-outline-rounded";
});

const iconColor = computed(() => {
  // If notification is inactive (viewed), make it gray
  if (props.inactive) {
    return "text-gray-400";
  }

  switch (props.type) {
    case "form":
      return "text-primary";
    case "pending":
      return "text-primary";
    case "confirmed":
      return "text-primary";
    case "comment":
      return "text-primary";
    case "status":
      return "text-primary";
    default:
      return "text-primary";
  }
});

const timeAgoColor = computed(() => {
  return props.inactive ? "text-gray-400" : "text-primary";
});

const titleColor = computed(() => {
  return props.inactive ? "text-gray-400" : "text-gray-900";
});

const descriptionColor = computed(() => {
  return props.inactive ? "text-gray-400" : "text-gray-500";
});

const isInactive = computed(() => props.inactive);

const handleMarkAsRead = () => {
  if (props.notificationId) {
    emit("markAsRead", props.notificationId);
  }
};

const handleDelete = () => {
  if (props.notificationId) {
    emit("delete", props.notificationId);
  }
};
</script>

<style scoped>
@keyframes pulse-once {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.animate-pulse-once {
  animation: pulse-once 0.6s ease-in-out;
  animation-delay: var(--animation-delay, 0ms);
}
</style>
