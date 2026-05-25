<template>
  <section v-if="modelValue" role="dialog" :aria-label="mode === 'create' ? 'Create ticket' : 'Edit ticket'">
    <v-card class="mt-4">
      <v-card-title>{{ mode === "create" ? "Create ticket" : "Edit ticket" }}</v-card-title>
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

          <label>
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

          <div class="d-flex ga-2 mt-4">
            <v-btn color="primary" type="submit" :loading="isSubmitting">{{ mode === "create" ? "Create" : "Save changes" }}</v-btn>
            <v-btn variant="text" type="button" @click="$emit('update:modelValue', false)">Cancel</v-btn>
          </div>
        </form>
      </v-card-text>
    </v-card>
  </section>
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

const buildPayload = (): CreateTicketPayload => {
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

const submit = async () => {
  if (!validate()) return;

  isSubmitting.value = true;
  submitError.value = "";

  try {
    if (props.mode === "edit" && props.ticket) {
      await patchTicket(props.ticket.id, buildPayload() as UpdateTicketPayload);
    } else {
      await createTicket(buildPayload());
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
.ticket-form {
  display: grid;
  gap: 1rem;
}

.ticket-form label {
  display: grid;
  gap: 0.25rem;
  font-weight: 600;
}

.ticket-form input,
.ticket-form select,
.ticket-form textarea {
  border: 1px solid rgb(var(--v-theme-outline));
  border-radius: 4px;
  padding: 0.5rem;
}

.ticket-form textarea {
  min-height: 6rem;
}

[role="alert"] {
  color: rgb(var(--v-theme-error));
  font-weight: 500;
}
</style>
