import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "./404.html",
          dest: "./",
        },
      ],
    }),
  ],
  base: "/on-chain-generator-viewer",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
