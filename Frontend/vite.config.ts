import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    proxy: {
      // Any request to /openwa-api/* will be forwarded to localhost:2785/api/*
      '/openwa-api': {
        target: 'http://localhost:2785',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openwa-api/, '/api'),
      },
      '/socket.io': {
        target: 'http://localhost:2785',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
