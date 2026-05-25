<template>
  <v-container class="py-8">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between ga-4">
        <span>Ticket management</span>
        <v-btn color="primary" @click="openCreateForm">Create ticket</v-btn>
      </v-card-title>

      <v-card-text>
        <form class="ticket-filters" aria-label="Ticket filters">
          <label>
            Status
            <select v-model="query.status" aria-label="Status filter" @change="onFilterChange">
              <option value="">All statuses</option>
              <option v-for="statusOption in ticketStatuses" :key="statusOption" :value="statusOption">
                {{ statusOption }}
              </option>
            </select>
          </label>

          <label>
            Priority
            <select v-model="query.priority" aria-label="Priority filter" @change="onFilterChange">
              <option value="">All priorities</option>
              <option v-for="priorityOption in ticketPriorities" :key="priorityOption" :value="priorityOption">
                {{ priorityOption }}
              </option>
            </select>
          </label>
        </form>

        <v-progress-linear v-if="isLoading" class="my-4" indeterminate role="status" aria-label="Loading tickets" />
        <p v-if="isLoading">Loading tickets...</p>

        <v-alert v-if="listError" class="my-4" type="error" role="alert">
          {{ listError }}
          <v-btn class="ml-4" variant="outlined" @click="loadTickets">Retry</v-btn>
        </v-alert>

        <v-table v-if="!listError && tickets.length > 0">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned to</th>
              <th>Created at</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in tickets" :key="ticket.id">
              <td>{{ ticket.subject }}</td>
              <td>{{ ticket.channel }}</td>
              <td>{{ ticket.status }}</td>
              <td>{{ ticket.priority }}</td>
              <td>{{ ticket.assigned_to || "Unassigned" }}</td>
              <td>{{ formatDate(ticket.created_at) }}</td>
              <td>
                <v-btn size="small" variant="text" @click="openEditForm(ticket)">Edit {{ ticket.subject }}</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-alert v-if="!isLoading && !listError && tickets.length === 0" class="my-4" type="info">
          No tickets found for the current query.
        </v-alert>

        <section class="pagination" aria-label="Ticket pagination">
          <p>
            Page {{ pagination.page }} of {{ Math.max(pagination.total_pages, 1) }} · {{ pagination.total }} total tickets
          </p>
          <div class="d-flex ga-2 flex-wrap">
            <v-btn
              v-for="pageNumber in visiblePages"
              :key="pageNumber"
              :color="pageNumber === pagination.page ? 'primary' : undefined"
              :variant="pageNumber === pagination.page ? 'flat' : 'outlined'"
              size="small"
              @click="changePage(pageNumber)"
            >
              Page {{ pageNumber }}
            </v-btn>
          </div>
        </section>
      </v-card-text>
    </v-card>

    <TicketFormDialog v-model="isFormOpen" :mode="formMode" :ticket="selectedTicket" @saved="onTicketSaved" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { listTickets } from "../api/tickets";
import TicketFormDialog from "../components/TicketFormDialog.vue";
import { ticketPriorities, ticketStatuses, type Ticket, type TicketListPagination, type TicketListQuery } from "../types/ticket";

const PAGE_SIZE = 20;

const tickets = ref<Ticket[]>([]);
const isLoading = ref(false);
const listError = ref("");
const pagination = reactive<TicketListPagination>({
  page: 1,
  page_size: PAGE_SIZE,
  total: 0,
  total_pages: 0
});
const query = reactive<Required<Pick<TicketListQuery, "page" | "page_size">> & Pick<TicketListQuery, "status" | "priority">>({
  page: 1,
  page_size: PAGE_SIZE,
  status: "",
  priority: ""
});

const isFormOpen = ref(false);
const formMode = ref<"create" | "edit">("create");
const selectedTicket = ref<Ticket | null>(null);

const visiblePages = computed(() => Array.from({ length: Math.max(pagination.total_pages, 1) }, (_, index) => index + 1));

const formatDate = (value: string): string => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

const loadTickets = async () => {
  isLoading.value = true;
  listError.value = "";

  try {
    const response = await listTickets(query);
    tickets.value = response.data;
    Object.assign(pagination, response.pagination);
    query.page = response.pagination.page;
    query.page_size = response.pagination.page_size;
  } catch (error) {
    tickets.value = [];
    listError.value = error instanceof Error ? error.message : "Ticket request failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const onFilterChange = () => {
  query.page = 1;
  void loadTickets();
};

const changePage = (page: number) => {
  if (page === query.page) return;
  query.page = page;
  void loadTickets();
};

const openCreateForm = () => {
  formMode.value = "create";
  selectedTicket.value = null;
  isFormOpen.value = true;
};

const openEditForm = (ticket: Ticket) => {
  formMode.value = "edit";
  selectedTicket.value = ticket;
  isFormOpen.value = true;
};

const onTicketSaved = () => {
  isFormOpen.value = false;
  void loadTickets();
};

onMounted(() => {
  void loadTickets();
});
</script>

<style scoped>
.ticket-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-block-end: 1rem;
}

.ticket-filters label {
  display: grid;
  gap: 0.25rem;
  font-weight: 600;
}

.ticket-filters select {
  min-width: 12rem;
  border: 1px solid rgb(var(--v-theme-outline));
  border-radius: 4px;
  padding: 0.5rem;
}

.pagination {
  margin-block-start: 1.5rem;
}
</style>
