import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";
  const isDev = !isProd;

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
      svgr({ 
        svgrOptions: { 
          icon: true,
          svgoConfig: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false
                  }
                }
              }
            ]
          }
        } 
      }),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          id: "/",
          name: "SNACKS di Chris",
          short_name: "SNACKS",
          description: "Loja de gostosuras em Goiânia – faça pedidos via WhatsApp ou retire aqui!",
          start_url: "./",
          display: "standalone",
          background_color: "#F1EDD2",
          theme_color: "#A9373E",
          orientation: "portrait-primary",
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
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
                cacheName: "static-assets",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com/,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "google-fonts-stylesheets",
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com/,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: isDev,
          type: "module",
          navigateFallback: "index.html",
        },
      }),
    ],
   /*css: {
      postcss: {
        config: false, // Desativa a busca automática de configuração
        plugins: [
          require('@tailwindcss/postcss')({
            config: './tailwind.config.js'
          }),
          require('autoprefixer'),
        ],
      },
    },*/
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      open: isDev,
      headers: {
        "Content-Security-Policy": `
          default-src 'self';
          connect-src 'self' 
            ${isDev ? "ws://localhost:5173" : ""}
            https://www.google-analytics.com 
            https://*.google-analytics.com 
            https://www.googletagmanager.com 
            https://*.googletagmanager.com
            https://www.mockachino.com;
          img-src 'self' data: blob: 
            https://www.google-analytics.com 
            https://*.google-analytics.com;
          style-src 'self' 'unsafe-inline' 
            https://fonts.googleapis.com;
          font-src 'self' 
            https://fonts.gstatic.com;
          script-src 'self' 'unsafe-inline' 
            https://www.googletagmanager.com 
            https://*.googletagmanager.com;
          frame-src 'none';
          worker-src 'self' blob:;
          manifest-src 'self';
        `.replace(/\n/g, '').replace(/\s{2,}/g, ' ')
      },
      proxy: {
        "/api": {
          target: "https://www.mockachino.com/a0c8bbde-7d0d-4a",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: false,
        },
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      emptyOutDir: true,
      target: "es2018",
      cssCodeSplit: true,
      sourcemap: isDev,
      minify: isProd ? "terser" : false,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
          assetFileNames: "assets/[name].[hash].[ext]",
          chunkFileNames: "assets/[name].[hash].js",
          entryFileNames: "assets/[name].[hash].js",
        },
      },
      chunkSizeWarningLimit: 1600,
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@fortawesome/fontawesome-svg-core",
        "@fortawesome/free-solid-svg-icons",
        "@fortawesome/react-fontawesome"
      ],
      exclude: ["js-big-decimal"],
    },
  };
});