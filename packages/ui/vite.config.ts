import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [tailwindcss()],
  pack: {
    entry: ["src/index.ts"],
    dts: true,
    exports: false,
    deps: {
      neverBundle: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
