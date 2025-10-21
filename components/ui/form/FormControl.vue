<script lang="ts" setup>
import { Slot } from "reka-ui";
import { useFormField } from "./useFormField";

const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
</script>

<template>
  <Slot
    :id="formItemId"
    data-slot="form-control"
    class="overflow-hidden"
    :aria-describedby="
      !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`
    "
    :aria-invalid="!!error"
  >
    <slot />
  </Slot>
</template>
