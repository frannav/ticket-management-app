<template>
  <v-container id="ticket-console" class="ticket-page py-8" fluid>
    <v-card class="blueprint-console">
      <v-card-title class="ticket-header">
        <div>
          <p class="section-kicker">Live schematic board</p>
          <h2>Ticket management</h2>
          <p class="section-copy">
            Calibrate incoming guest requests by status, priority, channel, hotel, assignee, and search signal.
          </p>
        </div>
        <div class="ticket-header__actions">
          <v-btn color="primary" @click="openCreateForm">Create ticket</v-btn>
          <v-btn variant="outlined" :loading="isLoading" @click="loadTickets">Refresh grid</v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <section class="metrics-grid" aria-label="Ticket workload metrics">
          <article class="metric-card">
            <span>Total signals</span>
            <strong>{{ pagination.total }}</strong>
          </article>
          <article class="metric-card">
            <span>Open circuits</span>
            <strong>{{ summary.open_circuits }}</strong>
          </article>
          <article class="metric-card">
            <span>Urgent load</span>
            <strong>{{ summary.urgent_load }}</strong>
          </article>
          <article class="metric-card">
            <span>Assigned tickets</span>
            <strong>{{ summary.assigned_tickets }}</strong>
          </article>
        </section>

        <form id="ticket-filters" class="ticket-filters ticket-filters--responsive" aria-label="Ticket filters" @submit.prevent="applyFilters">
          <label>
            Search signal
            <input v-model.trim="query.q" aria-label="Search filter" placeholder="Subject or description" />
          </label>

          <label>
            Hotel ID
            <input v-model.trim="query.hotel_id" aria-label="Hotel ID filter" placeholder="hotel-1" />
          </label>

          <label>
            Assigned to
            <input v-model.trim="query.assigned_to" aria-label="Assigned to filter" placeholder="agent id" />
          </label>

          <label>
            Channel
            <select v-model="query.channel" aria-label="Channel filter" @change="onFilterChange">
              <option value="">All channels</option>
              <option v-for="channelOption in ticketChannels" :key="channelOption" :value="channelOption">
                {{ channelOption }}
              </option>
            </select>
          </label>

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

          <div class="filter-actions">
            <v-btn color="primary" type="submit">Apply filters</v-btn>
            <v-btn variant="outlined" type="button" @click="resetFilters">Reset filters</v-btn>
          </div>
        </form>

        <div v-if="isLoading" class="ticket-list-state my-4" data-testid="ticket-list-state">
          <v-progress-linear indeterminate role="status" aria-label="Loading tickets" />
          <p>Loading tickets...</p>
        </div>

        <v-alert v-if="listError" class="ticket-list-state my-4" data-testid="ticket-list-state" type="error" role="alert">
          {{ listError }}
          <v-btn class="ml-4" variant="outlined" @click="loadTickets">Retry</v-btn>
        </v-alert>

        <div v-if="!listError && tickets.length > 0" class="ticket-table-scroll" role="region" aria-label="Scrollable ticket list" tabindex="0">
          <v-table class="ticket-table">
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
                <td>
                  <strong class="ticket-subject">{{ ticket.subject }}</strong>
                  <small>{{ ticket.hotel_id }}</small>
                </td>
                <td><span class="schematic-pill">{{ ticket.channel }}</span></td>
                <td><span class="schematic-pill">{{ ticket.status }}</span></td>
                <td><span class="schematic-pill" :class="`schematic-pill--${ticket.priority}`">{{ ticket.priority }}</span></td>
                <td>{{ ticket.assigned_to || "Unassigned" }}</td>
                <td>{{ formatDate(ticket.created_at) }}</td>
                <td>
                  <v-btn size="small" variant="outlined" @click="openEditForm(ticket)">Edit {{ ticket.subject }}</v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <v-alert v-if="!isLoading && !listError && tickets.length === 0" class="ticket-list-state my-4" data-testid="ticket-list-state" type="info">
          No tickets found for the current query.
        </v-alert>

        <section class="pagination" aria-label="Ticket pagination">
          <p>
            Page {{ pagination.page }} of {{ Math.max(pagination.total_pages, 1) }} · {{ pagination.total }} total tickets
          </p>
          <div class="d-flex ga-2 flex-wrap">
            <template v-for="item in visiblePages" :key="item.key">
              <v-btn
                v-if="item.type === 'page'"
                :color="item.value === pagination.page ? 'primary' : undefined"
                :variant="item.value === pagination.page ? 'flat' : 'outlined'"
                size="small"
                @click="changePage(item.value)"
              >
                Page {{ item.value }}
              </v-btn>
              <span v-else class="pagination-ellipsis" aria-hidden="true">…</span>
            </template>
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
import {
  ticketChannels,
  ticketPriorities,
  ticketStatuses,
  type Ticket,
  type TicketChannel,
  type TicketListPagination,
  type TicketListResponse,
  type TicketListQuery,
  type TicketPriority,
  type TicketStatus
} from "../types/ticket";

const PAGE_SIZE = 20;
const PAGINATION_RADIUS = 2;

const tickets = ref<Ticket[]>([]);
const isLoading = ref(false);
const listError = ref("");
const pagination = reactive<TicketListPagination>({
  page: 1,
  page_size: PAGE_SIZE,
  total: 0,
  total_pages: 0
});
const summary = reactive<TicketListResponse["summary"]>({
  open_circuits: 0,
  urgent_load: 0,
  assigned_tickets: 0
});
type QueryState = Required<Pick<TicketListQuery, "page" | "page_size">> & {
  hotel_id: string;
  channel: TicketChannel | "";
  status: TicketStatus | "";
  priority: TicketPriority | "";
  assigned_to: string;
  q: string;
};

const query = reactive<QueryState>({
  page: 1,
  page_size: PAGE_SIZE,
  hotel_id: "",
  channel: "",
  status: "",
  priority: "",
  assigned_to: "",
  q: ""
});

const isFormOpen = ref(false);
const formMode = ref<"create" | "edit">("create");
const selectedTicket = ref<Ticket | null>(null);

type VisiblePage = { type: "page"; key: string; value: number } | { type: "ellipsis"; key: string };

const visiblePages = computed<VisiblePage[]>(() => {
  const totalPages = Math.max(pagination.total_pages, 1);
  const currentPage = Math.min(Math.max(pagination.page, 1), totalPages);
  const pageNumbers = new Set<number>([1, totalPages]);

  for (let page = currentPage - PAGINATION_RADIUS; page <= currentPage + PAGINATION_RADIUS; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pageNumbers.add(page);
    }
  }

  const sortedPages = [...pageNumbers].sort((left, right) => left - right);

  return sortedPages.flatMap((page, index) => {
    const previous = sortedPages[index - 1];
    const item: VisiblePage = { type: "page", key: `page-${page}`, value: page };

    if (previous && page - previous > 1) {
      return [{ type: "ellipsis", key: `ellipsis-${previous}-${page}` } satisfies VisiblePage, item];
    }

    return [item];
  });
});

const formatDate = (value: string): string => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

const loadTickets = async () => {
  isLoading.value = true;
  listError.value = "";

  try {
    const response = await listTickets(query);
    tickets.value = response.data;
    Object.assign(pagination, response.pagination);
    Object.assign(summary, response.summary);
    query.page = response.pagination.page;
    query.page_size = response.pagination.page_size;
  } catch (error) {
    tickets.value = [];
    Object.assign(summary, {
      open_circuits: 0,
      urgent_load: 0,
      assigned_tickets: 0
    });
    listError.value = error instanceof Error ? error.message : "Ticket request failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const onFilterChange = () => {
  query.page = 1;
  void loadTickets();
};

const applyFilters = () => {
  query.page = 1;
  void loadTickets();
};

const resetFilters = () => {
  Object.assign(query, {
    page: 1,
    page_size: PAGE_SIZE,
    hotel_id: "",
    channel: "",
    status: "",
    priority: "",
    assigned_to: "",
    q: ""
  });
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
.ticket-page {
  max-width: 1180px;
}

.blueprint-console {
  background:
    linear-gradient(135deg, rgba(125, 211, 252, 0.1), transparent 42%),
    rgba(4, 19, 41, 0.76);
  border: 1px solid rgba(198, 235, 255, 0.58);
  border-radius: 0;
  box-shadow: 0 1.5rem 5rem rgba(0, 0, 0, 0.28), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  overflow: visible;
  position: relative;
}

.blueprint-console::before,
.blueprint-console::after {
  border-color: rgba(198, 235, 255, 0.78);
  border-style: solid;
  content: "";
  height: 2rem;
  position: absolute;
  width: 2rem;
}

.blueprint-console::before {
  border-width: 1px 0 0 1px;
  left: -0.5rem;
  top: -0.5rem;
}

.blueprint-console::after {
  border-width: 0 1px 1px 0;
  bottom: -0.5rem;
  right: -0.5rem;
}

.ticket-header {
  align-items: flex-start;
  border-bottom: 1px solid rgba(198, 235, 255, 0.28);
  display: flex;
  gap: 1.25rem;
  justify-content: space-between;
  padding: clamp(1rem, 3vw, 1.5rem);
  white-space: normal;
}

.ticket-header h2 {
  color: #ffffff;
  font-size: clamp(1.8rem, 4vw, 3rem);
  letter-spacing: -0.055em;
  line-height: 1;
  margin: 0;
}

.section-kicker {
  color: #b7e4ff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin: 0 0 0.55rem;
  text-transform: uppercase;
}

.section-copy {
  color: rgba(248, 252, 255, 0.72);
  font-size: 0.95rem;
  line-height: 1.55;
  margin: 0.75rem 0 0;
  max-width: 42rem;
}

.ticket-header__actions,
.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.metrics-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-block-end: 1rem;
}

.metric-card {
  border: 1px solid rgba(198, 235, 255, 0.38);
  min-height: 7rem;
  padding: 1rem;
  position: relative;
}

.metric-card::after {
  background: rgba(198, 235, 255, 0.58);
  content: "";
  height: 1px;
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  width: 2.2rem;
}

.metric-card span {
  color: #b7e4ff;
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.metric-card strong {
  color: #ffffff;
  display: block;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: clamp(2rem, 5vw, 3.15rem);
  line-height: 1;
  margin-block-start: 1rem;
}

.ticket-filters {
  border: 1px solid rgba(198, 235, 255, 0.28);
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-block-end: 1.2rem;
  padding: 1rem;
}

.ticket-filters label {
  display: grid;
  gap: 0.4rem;
  color: #b7e4ff;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.ticket-filters input,
.ticket-filters select {
  background: rgba(3, 16, 36, 0.72);
  border: 1px solid rgba(198, 235, 255, 0.54);
  border-radius: 0;
  color: #f8fcff;
  min-height: 2.8rem;
  min-width: 0;
  padding: 0.55rem 0.7rem;
}

.ticket-filters input::placeholder {
  color: rgba(248, 252, 255, 0.38);
}

.filter-actions {
  align-items: end;
  grid-column: 1 / -1;
}

.ticket-table-scroll {
  background: transparent;
  border: 1px solid rgba(198, 235, 255, 0.28);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.ticket-table {
  background: transparent;
  min-width: 56rem;
}

.ticket-table :deep(.v-table__wrapper) {
  background: transparent;
}

.ticket-table :deep(table) {
  background: transparent;
}

.ticket-table :deep(thead),
.ticket-table :deep(tbody),
.ticket-table :deep(tr) {
  background: transparent;
}

.ticket-table :deep(th) {
  background: transparent;
  color: #b7e4ff;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.ticket-table :deep(td) {
  background: transparent;
  border-bottom: 1px solid rgba(198, 235, 255, 0.14);
  color: rgba(248, 252, 255, 0.88);
}

.ticket-subject {
  color: #ffffff;
  display: block;
  font-weight: 800;
}

.ticket-subject + small {
  color: rgba(183, 228, 255, 0.7);
  display: block;
  margin-block-start: 0.2rem;
}

.schematic-pill {
  border: 1px solid rgba(198, 235, 255, 0.5);
  color: #e8f8ff;
  display: inline-flex;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.76rem;
  padding: 0.2rem 0.45rem;
}

.schematic-pill--urgent {
  border-color: rgba(252, 165, 165, 0.86);
  color: #fecaca;
}

.schematic-pill--high {
  border-color: rgba(253, 230, 138, 0.86);
  color: #fde68a;
}

.ticket-list-state {
  border: 1px dashed rgba(198, 235, 255, 0.42);
  overflow-wrap: anywhere;
  padding: 1rem;
}

.ticket-list-state p {
  margin: 0.75rem 0 0;
}

.pagination {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  margin-block-start: 1.5rem;
}

.pagination p {
  color: rgba(248, 252, 255, 0.76);
  margin: 0;
}

.pagination-ellipsis {
  align-items: center;
  display: inline-flex;
  min-height: 2rem;
  padding-inline: 0.25rem;
}

@media (max-width: 960px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ticket-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .ticket-page {
    padding-inline: 0.75rem;
  }

  .ticket-header {
    align-items: stretch;
    flex-direction: column;
  }

  .ticket-header :deep(.v-btn),
  .filter-actions :deep(.v-btn) {
    width: 100%;
  }

  .metrics-grid,
  .ticket-filters {
    display: grid;
    grid-template-columns: 1fr;
  }

  .ticket-filters input,
  .ticket-filters select {
    width: 100%;
  }

  .pagination :deep(.v-btn) {
    flex: 1 1 8rem;
  }
}
</style>
