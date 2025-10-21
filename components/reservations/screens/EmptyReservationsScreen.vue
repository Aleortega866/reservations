<template>
  <div class="py-6">
    <!-- Botones de acción principales -->
    <ActionButtons
      :has-reservations="hasReservations"
      @new-reservation="$emit('new-reservation')"
      @view-material="$emit('view-material')"
    />

    <!-- Mensaje principal -->
    <EmptyStateMessage :has-reservations="hasReservations" />
  </div>
</template>

<script setup>
import ActionButtons from "./ActionButtons.vue";
import EmptyStateMessage from "./EmptyStateMessage.vue";

defineProps({
  hasReservations: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["new-reservation", "view-material"]);
</script>
