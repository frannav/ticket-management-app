<template>
  <v-app class="blueprint-app">
    <v-main class="blueprint-main">
      <TicketListView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import TicketListView from "./views/TicketListView.vue";
</script>

<style scoped>
:global(html) {
  scroll-behavior: smooth;
}

:global(body) {
  margin: 0;
}

.blueprint-app {
  --blueprint-blue-950: #041329;
  --blueprint-blue-900: #061a3a;
  background:
    radial-gradient(circle at 18% 10%, rgba(56, 189, 248, 0.22), transparent 32rem),
    radial-gradient(circle at 80% 0%, rgba(147, 197, 253, 0.16), transparent 26rem),
    linear-gradient(135deg, var(--blueprint-blue-950), var(--blueprint-blue-900) 54%, #031024);
  color: #f8fcff;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.blueprint-main {
  min-height: 100vh;
  padding-block-start: clamp(0.5rem, 2vw, 1.25rem);
}
</style>
