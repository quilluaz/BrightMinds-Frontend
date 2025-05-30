import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: ["phosphor-react"],
  },
  publicDir: "public",
  server: {
    port: 5173,
    proxy: {
      "/images": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
