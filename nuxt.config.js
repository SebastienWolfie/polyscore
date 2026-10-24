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
  // ---- private (server only) ----
  relayerPrivateKey: '9e5a229c09c1bc688daa9a05e214782b544489fa502e641749a07db0c3bbe430',
  redisUrl: 'redis://default:bTBHK6UQGeRpavvm7LzSSZtkdrDeFoGa@priceless-hypercompact-gleeful-89274.db.redis.io:14490',
  allowedOrigins: 'http://localhost:3000,https://ekiden.web.app', // comma-separated

  bridge: {
    ethRpc: 'https://eth-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj',          // empty = preset RPC
    uniRpc: 'https://unichain-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj',          // empty = preset RPC
    maxAmount: process.env.BRIDGE_MAX_AMOUNT || '10000',        // USDC, 6 decimals
    gasDripEth: process.env.BRIDGE_GAS_DRIP_ETH || '0.00005',
    gasMinEth: process.env.BRIDGE_GAS_MIN_ETH || '0.00002',
    gasCooldownMin: process.env.BRIDGE_GAS_COOLDOWN_MIN || '60',
    minConfirmations: process.env.BRIDGE_MIN_CONFIRMATIONS || '', // empty = 2 mainnet / 1 testnet
    budgetMs: process.env.BRIDGE_BUDGET_MS || '8000',
  },

  // ---- public (also exposed to the client) ----
  public: {
    bridgeNetwork: 'mainnet', // 'mainnet' | 'testnet'
    vaultAddress: '0x6922672247a0155b00D203cb1E345E996bD0Cb18',          // EkidenVault on Ethereum
    uniToken: '0xa23352Ab0114A023C92a206FE786AC5472C7d08e',                  // USDC token on Unichain
  },
},
});
