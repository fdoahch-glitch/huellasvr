import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    sourcemap: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          babylon: ["@babylonjs/core"]
        }
      }
    }
  },
  server: { host: "0.0.0.0" }
});