import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "blueprint",
    themes: {
      blueprint: {
        dark: true,
        colors: {
          background: "#061A3A",
          surface: "#092A5B",
          primary: "#7DD3FC",
          secondary: "#B7E4FF",
          accent: "#38BDF8",
          error: "#FCA5A5",
          info: "#93C5FD",
          success: "#86EFAC",
          warning: "#FDE68A",
          outline: "#8EC5FF"
        }
      }
    }
  }
});
