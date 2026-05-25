<template>
  <v-app>
    <v-app-bar color="primary" title="Ticket Management" />
    <v-main>
      <TicketListView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import TicketListView from "./views/TicketListView.vue";
</script>
