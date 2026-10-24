// https://v3.nuxtjs.org/api/configuration/nuxt.config


export default defineNuxtConfig({
  css: [
    "~/assets/css/tailwind.css",
    "~/layouts/global.css"
  ],
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon"],
  plugins: [{ src: "@/plugins/aos", ssr: false, mode: "client" }],
  nitro: {
    preset: 'vercel'
  },
  routeRules: {
    '/api/**': { cache: false } 
  },
  runtimeConfig: {
    public: {
      bridgeNetwork: 'mainnet',
      relayerPrivateKey: '9e5a229c09c1bc688daa9a05e214782b544489fa502e641749a07db0c3bbe430',
      allowedOrigins: 'https://ekiden.web.app',
      relayerUrl: 'https://www.polyscore.net/api/ekiden/bridge',
      vaultAddress: '0x74E31a1B947C472bcBe483a609D7d6b44C49d4Af',   // EkidenVault on Ethereum Sepolia
      uniToken: '0xa23352Ab0114A023C92a206FE786AC5472C7d08e',       // your deployed token on Unichain Sepolia
      ethUsdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',        // optional override
    },
  }
});
