import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: true, // Listen on all addresses (required for Docker)
        port: 5173,
        strictPort: true,
        watch: {
            usePolling: true, // Required for hot reload in Docker
        },
    },
});
