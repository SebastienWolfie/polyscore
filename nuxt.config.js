// https://v3.nuxtjs.org/api/configuration/nuxt.config
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// export default defineNuxtConfig({
//     css: ['~/assets/css/tailwind.css', '~/Layouts/global.css'],
//     modules: [
//       '@nuxtjs/tailwindcss'
//     ],
//     nitro: {
//       preset: 'netlify'
//     }
//   });

export default defineNuxtConfig({
  css: [
    "~/assets/css/tailwind.css",
    "~/Layouts/global.css"
  ],
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon"],
  ssr: false,
  plugins: [{ src: "@/plugins/aos", ssr: false, mode: "client" }],
  vite: {
    plugins: [
      nodePolyfills({
        // Include buffer and process
        include: ['buffer', 'process'],
        
        // This is the most crucial part: forces the globals
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        
        protocolImports: true,
      }),
    ],
    // 4. Also force optimization for the Solana libraries if needed (optional, but helpful)
    optimizeDeps: {
        include: ['@solana/web3.js', '@solana/spl-token'],
    }
  }
});

// export default {
//   vite: {
//     optimizeDeps: {
//       include: [
//         // 'vue-google-maps-community-fork',
//         "fast-deep-equal",
//       ],
//     },
//   },
//   css: [
//     "~/assets/css/tailwind.css",
//     "~/Layouts/global.css"
//   ],
//   modules: ["@nuxtjs/tailwindcss", "nuxt-icon"],
//   target: "static",
//   router: {
//     base: "/Coinpad/",
//   },
//   plugins: [{ src: "@/plugins/aos", ssr: false, mode: "client" }],
// };