<template>
  <div v-if="modelValue" class="ticket-dialog-backdrop" @click.self="$emit('update:modelValue', false)" @keydown.esc="$emit('update:modelValue', false)">
    <section
      class="ticket-dialog ticket-dialog--mobile-friendly"
      role="dialog"
      aria-modal="true"
      :aria-label="mode === 'create' ? 'Create ticket' : 'Edit ticket'"
    >
      <v-card class="blueprint-form-card">
        <v-card-title>
          <div>
            <span class="form-kicker">Ticket drafting module</span>
            {{ mode === "create" ? "Create ticket" : "Edit ticket" }}
          </div>
          <v-btn class="ticket-dialog-close" variant="outlined" size="small" type="button" @click="$emit('update:modelValue', false)">
            Close
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-alert v-if="submitError" class="mb-4" type="error" role="alert">{{ submitError }}</v-alert>

          <form aria-label="Ticket form" class="ticket-form" @submit.prevent="submit">
            <label>
              Hotel ID
              <input v-model.trim="form.hotel_id" aria-label="Hotel ID" />
              <span v-if="errors.hotel_id" role="alert">{{ errors.hotel_id }}</span>
            </label>

            <label>
              Subject
              <input v-model.trim="form.subject" aria-label="Subject" />
              <span v-if="errors.subject" role="alert">{{ errors.subject }}</span>
            </label>

            <label class="ticket-form__wide">
              Description
              <textarea v-model.trim="form.description" aria-label="Description" />
              <span v-if="errors.description" role="alert">{{ errors.description }}</span>
            </label>

            <label>
              Channel
              <select v-model="form.channel" aria-label="Channel">
                <option value="">Select channel</option>
                <option v-for="channel in ticketChannels" :key="channel" :value="channel">{{ channel }}</option>
              </select>
              <span v-if="errors.channel" role="alert">{{ errors.channel }}</span>
            </label>

            <label>
              Priority
              <select v-model="form.priority" aria-label="Priority">
                <option value="">Select priority</option>
                <option v-for="priority in ticketPriorities" :key="priority" :value="priority">{{ priority }}</option>
              </select>
              <span v-if="errors.priority" role="alert">{{ errors.priority }}</span>
            </label>

            <label>
              Status
              <select v-model="form.status" aria-label="Status">
                <option value="">Use backend default</option>
                <option v-for="status in ticketStatuses" :key="status" :value="status">{{ status }}</option>
              </select>
            </label>

            <label>
              Assigned to
              <input v-model.trim="form.assigned_to" aria-label="Assigned to" />
            </label>

            <div class="ticket-form-actions d-flex ga-2 mt-4">
              <v-btn color="primary" type="submit" :loading="isSubmitting">{{ mode === "create" ? "Create" : "Save changes" }}</v-btn>
              <v-btn variant="text" type="button" @click="$emit('update:modelValue', false)">Cancel</v-btn>
            </div>
          </form>
        </v-card-text>
      </v-card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { createTicket, patchTicket } from "../api/tickets";
import {
  ticketChannels,
  ticketPriorities,
  ticketStatuses,
  type CreateTicketPayload,
  type Ticket,
  type TicketChannel,
  type TicketPriority,
  type TicketStatus,
  type UpdateTicketPayload
} from "../types/ticket";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit";
  ticket: Ticket | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

type FormState = {
  hotel_id: string;
  subject: string;
  description: string;
  channel: TicketChannel | "";
  priority: TicketPriority | "";
  status: TicketStatus | "";
  assigned_to: string;
};

const emptyForm = (): FormState => ({
  hotel_id: "",
  subject: "",
  description: "",
  channel: "",
  priority: "",
  status: "",
  assigned_to: ""
});

const form = reactive<FormState>(emptyForm());
const errors = reactive<Partial<Record<keyof FormState, string>>>({});
const isSubmitting = ref(false);
const submitError = ref("");

const resetErrors = () => {
  for (const key of Object.keys(errors) as Array<keyof FormState>) {
    delete errors[key];
  }
  submitError.value = "";
};

const populateForm = () => {
  resetErrors();
  const source = props.ticket;
  Object.assign(
    form,
    source
      ? {
          hotel_id: source.hotel_id,
          subject: source.subject,
          description: source.description,
          channel: source.channel,
          priority: source.priority,
          status: source.status,
          assigned_to: source.assigned_to ?? ""
        }
      : emptyForm()
  );
};

watch(
  () => [props.modelValue, props.ticket, props.mode] as const,
  ([isOpen]) => {
    if (isOpen) {
      populateForm();
    }
  },
  { immediate: true }
);

const validate = (): boolean => {
  resetErrors();

  if (!form.hotel_id) errors.hotel_id = "Hotel ID is required";
  if (!form.subject) errors.subject = "Subject is required";
  if (form.subject.length > 200) errors.subject = "Subject must be 200 characters or fewer";
  if (!form.description) errors.description = "Description is required";
  if (!form.channel) errors.channel = "Channel is required";
  if (!form.priority) errors.priority = "Priority is required";

  return Object.keys(errors).length === 0;
};

const buildCreatePayload = (): CreateTicketPayload => {
  const payload: CreateTicketPayload = {
    hotel_id: form.hotel_id,
    subject: form.subject,
    description: form.description,
    channel: form.channel as TicketChannel,
    priority: form.priority as TicketPriority
  };

  if (form.status) payload.status = form.status;
  if (form.assigned_to) payload.assigned_to = form.assigned_to;

  return payload;
};

const buildEditPayload = (): UpdateTicketPayload => {
  const source = props.ticket;
  if (!source) return buildCreatePayload();

  const payload: UpdateTicketPayload = {};
  const assignedTo = form.assigned_to || null;

  if (form.hotel_id !== source.hotel_id) payload.hotel_id = form.hotel_id;
  if (form.subject !== source.subject) payload.subject = form.subject;
  if (form.description !== source.description) payload.description = form.description;
  if (form.channel !== source.channel) payload.channel = form.channel as TicketChannel;
  if (form.priority !== source.priority) payload.priority = form.priority as TicketPriority;
  if (form.status && form.status !== source.status) payload.status = form.status;
  if (assignedTo !== source.assigned_to) payload.assigned_to = assignedTo;

  return Object.keys(payload).length > 0 ? payload : buildCreatePayload();
};

const submit = async () => {
  if (!validate()) return;

  isSubmitting.value = true;
  submitError.value = "";

  try {
    if (props.mode === "edit" && props.ticket) {
      await patchTicket(props.ticket.id, buildEditPayload());
    } else {
      await createTicket(buildCreatePayload());
    }

    emit("saved");
    if (props.mode === "create") {
      Object.assign(form, emptyForm());
    }
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : "Unable to save the ticket. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.ticket-dialog-backdrop {
  align-items: center;
  background:
    linear-gradient(rgba(3, 16, 36, 0.82), rgba(3, 16, 36, 0.88)),
    radial-gradient(circle at 50% 20%, rgba(125, 211, 252, 0.16), transparent 26rem);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: clamp(0.75rem, 3vw, 2rem);
  position: fixed;
  z-index: 1000;
}

.ticket-dialog-backdrop::before {
  background-image:
    linear-gradient(rgba(198, 235, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(198, 235, 255, 0.08) 1px, transparent 1px);
  background-size: 1rem 1rem;
  content: "";
  inset: 0;
  pointer-events: none;
  position: absolute;
}

.blueprint-form-card {
  background:
    linear-gradient(135deg, rgba(125, 211, 252, 0.1), transparent 38%),
    rgba(4, 19, 41, 0.94);
  border: 1px solid rgba(198, 235, 255, 0.58);
  border-radius: 0;
  box-shadow: 0 1.25rem 4rem rgba(0, 0, 0, 0.32);
}

.blueprint-form-card :deep(.v-card-title) {
  align-items: start;
  border-bottom: 1px solid rgba(198, 235, 255, 0.24);
  color: #ffffff;
  display: flex;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 800;
  gap: 0.25rem;
  justify-content: space-between;
  letter-spacing: -0.035em;
  white-space: normal;
}

.ticket-dialog-close {
  flex: 0 0 auto;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-kicker {
  color: #b7e4ff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.ticket-form {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.ticket-dialog {
  box-shadow: 0 2rem 5rem rgba(0, 0, 0, 0.44);
  max-height: min(42rem, calc(100vh - 2rem));
  overflow-y: auto;
  position: relative;
  width: min(54rem, 100%);
  z-index: 1;
}

.ticket-form label {
  display: grid;
  gap: 0.4rem;
  color: #b7e4ff;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.ticket-form__wide {
  grid-column: 1 / -1;
}

.ticket-form input,
.ticket-form select,
.ticket-form textarea {
  background: rgba(3, 16, 36, 0.72);
  border: 1px solid rgba(198, 235, 255, 0.54);
  border-radius: 0;
  color: #f8fcff;
  min-height: 2.8rem;
  padding: 0.55rem 0.7rem;
}

.ticket-form textarea {
  min-height: 6rem;
}

.ticket-form input,
.ticket-form select,
.ticket-form textarea {
  width: 100%;
}

.ticket-form-actions {
  flex-wrap: wrap;
  grid-column: 1 / -1;
}

[role="alert"] {
  color: #fecaca;
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
}

@media (max-width: 600px) {
  .ticket-dialog-backdrop {
    align-items: stretch;
    padding: 0.5rem;
  }

  .ticket-dialog {
    max-height: calc(100vh - 1rem);
  }

  .blueprint-form-card :deep(.v-card-title) {
    align-items: stretch;
    flex-direction: column;
  }

  .ticket-form {
    grid-template-columns: 1fr;
  }

  .ticket-dialog-close,
  .ticket-form-actions :deep(.v-btn) {
    flex: 1 1 10rem;
  }
}
</style>
