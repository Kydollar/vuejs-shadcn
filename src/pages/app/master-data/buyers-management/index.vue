<script setup>
import Page from '@/components/global-layout/basic-page.vue'
import tasks from './components/data/tasks.json'
import { columns } from './components/table/columns'
import DataTable from './components/table/data-table.vue'
import TaskCreate from './components/table/task-create.vue'
import TaskImport from './components/table/task-import.vue'
</script>

<template>
  <Page
    title="Tasks"
    description="Tasks description"
    sticky
  >
    <template #actions>
      <TaskImport />
      <TaskCreate />
    </template>
    <div class="overflow-x-auto">
      <DataTable :data="tasks" :columns="columns" />
    </div>
  </Page>
</template>

<style scoped>
</style>
