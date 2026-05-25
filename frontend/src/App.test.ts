import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App.vue";
import { mountWithVuetify } from "./test/mount";

describe("App", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mounts the Vuetify ticket management shell", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [],
            pagination: { page: 1, page_size: 20, total: 0, total_pages: 0 }
          })
        )
      )
    );
    const wrapper = mountWithVuetify(App);

    expect(wrapper.text()).toContain("Ticket Management");
    expect(wrapper.text()).toContain("Ticket management");
  });
});
