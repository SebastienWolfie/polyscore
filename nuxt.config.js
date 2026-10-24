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
  relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY || '',
  redisUrl: process.env.REDIS_URL || process.env.KV_URL || '',
  allowedOrigins: process.env.ALLOWED_ORIGINS || '', // comma-separated

  bridge: {
    ethRpc: process.env.BRIDGE_ETH_RPC || '',          // empty = preset RPC
    uniRpc: process.env.BRIDGE_UNI_RPC || '',          // empty = preset RPC
    maxAmount: process.env.BRIDGE_MAX_AMOUNT || '10000',        // USDC, 6 decimals
    gasDripEth: process.env.BRIDGE_GAS_DRIP_ETH || '0.00005',
    gasMinEth: process.env.BRIDGE_GAS_MIN_ETH || '0.00002',
    gasCooldownMin: process.env.BRIDGE_GAS_COOLDOWN_MIN || '60',
    minConfirmations: process.env.BRIDGE_MIN_CONFIRMATIONS || '', // empty = 2 mainnet / 1 testnet
    budgetMs: process.env.BRIDGE_BUDGET_MS || '8000',
  },

  // ---- public (also exposed to the client) ----
  public: {
    bridgeNetwork: process.env.BRIDGE_NETWORK || 'testnet', // 'mainnet' | 'testnet'
    vaultAddress: process.env.VAULT_ADDRESS || '',          // EkidenVault on Ethereum
    uniToken: process.env.UNI_TOKEN || '',                  // USDC token on Unichain
  },
},
});
