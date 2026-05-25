import { mount, type VueWrapper } from "@vue/test-utils";
import type { Component } from "vue";
import { vuetify } from "../plugins/vuetify";

export const mountWithVuetify = (component: Component): VueWrapper =>
  mount(component, {
    global: {
      plugins: [vuetify]
    },
    attachTo: document.body
  });
