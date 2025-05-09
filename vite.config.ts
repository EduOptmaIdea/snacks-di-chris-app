import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    base: "./",
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@img": resolve(__dirname, "src/assets/imgs"),
        "@icons": resolve(__dirname, "src/assets/imgs/icons"),
      },
    },
    plugins: [
      react(),

      // Transform SVGs into React components
      svgr({ svgrOptions: { icon: true } }),

      // PWA integration
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          id: "/",
          name: "SNACKS di Chris",
          short_name: "SNACKS",
          description:
            "Loja de gostosuras em Goiânia – faça pedidos via WhatsApp ou retire aqui!",
          start_url: "./",
          display: "standalone",
          background_color: "#F1EDD2",
          theme_color: "#A9373E",
          orientation: "portrait-primary",
          icons: [
            { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          ],
          screenshots: [
            {
              src: "/screenshots/home-wide.png",
              sizes: "1280x720",
              type: "image/png",
              label: "Visão geral - desktop",
              form_factor: "wide",
            },
            {
              src: "/screenshots/home-portrait.png",
              sizes: "720x1280",
              type: "image/png",
              label: "Visão geral - mobile",
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /\.(?:js|css|html|png|jpg|jpeg|svg|webp|gif)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "static-resources",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
                },
              },
            },
          ],
        },
      }),
    ],
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      // proxy config if needed
      proxy: {
        "/api": {
          target: "https://www.mockachino.com/a0c8bbde-7d0d-4a",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      emptyOutDir: true,
      target: "es2018",
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },
    },
  };
});
