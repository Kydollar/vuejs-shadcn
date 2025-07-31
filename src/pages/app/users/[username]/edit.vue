<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const username = route.params.username
</script>

<template>
  <div>
    <h1>Edit User: {{ username }}</h1>
  </div>
</template>
