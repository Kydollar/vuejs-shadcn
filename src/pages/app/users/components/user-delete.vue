<script setup>
import { h } from 'vue'
import { toast } from 'vue-sonner'

const { user } = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['remove'])

function handleRemove() {
  toast(`The following task has been deleted:`, {
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(user, null, 2))),
  })

  emits('remove')
}
</script>

<template>
  <div>
    <UiDialogTitle>
      Delete this user: {{ user.username }} ?
    </UiDialogTitle>
    <UiDialogDescription class="mt-2 font-medium">
      You are about to delete a user with the ID {{ user.id }}.This action cannot be undone.
    </UiDialogDescription>

    <UiDialogFooter>
      <UiDialogClose as-child>
        <UiButton variant="outline">
          Cancel
        </UiButton>
      </UiDialogClose>

      <UiDialogClose as-child>
        <UiButton variant="destructive" @click="handleRemove">
          Delete
        </UiButton>
      </UiDialogClose>
    </UiDialogFooter>
  </div>
</template>

<style scoped>

</style>
