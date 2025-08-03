<script setup>
import Page from '@/components/global-layout/basic-page.vue'

import { users } from './components/data/users'
import { columns } from './components/table/columns'
import DataTable from './components/table/data-table.vue'
import UserCreate from './components/user-create.vue'
import UserInvite from './components/user-invite.vue'
</script>

<template>
  <Page
    title="Users"
    description="Users description"
    sticky
  >
    <template #actions>
      <UserInvite />
      <UserCreate />
    </template>
    <div class="overflow-x-auto">
      <DataTable :data="users" :columns="columns" />
    </div>
  </Page>
</template>

<style scoped>
</style>
