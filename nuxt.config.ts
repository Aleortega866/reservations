// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  css: ["@/assets/css/tailwind.css"],
  app: {
    head: {
      link: [],
      script: [
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.17/signalr.min.js",
        },
      ],
    },
    keepalive: true,
  },
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/']
    }
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@nuxtjs/color-mode"],
    },
    css: {
      devSourcemap: true,
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  },
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
  },
  modules: [
    "@nuxtjs/color-mode",
    "shadcn-nuxt",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "vue-sonner/nuxt",
    "@formkit/auto-animate/nuxt",
    "@samk-dev/nuxt-vcalendar",
    "@nuxtjs/device",
  ],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error provided by @nuxtjs/color-mode module via augmentation
  colorMode: {
    classSuffix: "",
    preference: "light",
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  compatibilityDate: "2025-05-15",
  devtools: { enabled: false },
  build: {
    transpile: ["@vueuse/core"],
  },
  piniaPluginPersistedstate: {
    storage: 'cookies',
    cookieOptions: {
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 año en segundos
    },
    debug: true,
    key: 'mide_%id',
  },
});