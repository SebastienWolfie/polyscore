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
    // ---- server only (never sent to the browser) ----
    relayerPrivateKey: '3eb9387730b821535d369caf0c17b6bdfd76a3dd3957286d29b4be048b75f355',   // pays Unichain gas, mints + delivers USDC (UNI); must be allowed to call mintTokens
    approverPrivateKey: 'ae24ceb31a80270153fc3b49450abdb0589d35fbe7d46c941b664db199899f50',  // separate key: ONLY signs withdrawal approvals; its address is the vault's `approver`
    redisUrl: 'redis://default:bTBHK6UQGeRpavvm7LzSSZtkdrDeFoGa@priceless-hypercompact-gleeful-89274.db.redis.io:14490',
    allowedOrigins: 'http://localhost:3000,https://ekiden.web.app,https://unichainbridge.web.app,https://unichainbridge.xyz,unibridgex.web.app',      // comma separated, e.g. https://unichainbridge.web.app
    bridge: {
      ethRpc: 'https://eth-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj', 
      uniRpc: 'https://unichain-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj',
      minConfirmations: '',  // Ethereum confirmations before delivering (default 2 mainnet / 1 testnet)
      budgetMs: '',
      maxAmount: '80000',    // per transfer, USD; keep equal to the vault's maxAmount
      gasDripEth: '', gasMinEth: '', gasCooldownMin: '',
    },
 
    // ---- public (sent to the browser) ----
    public: {
      bridgeNetwork: 'mainnet',   // 'mainnet' or 'testnet'. Start on testnet.
      vaultAddress: '0x784ca83Aa4F321A9217424274d5eE752EF742F1b',           // UniBridgeVault on Ethereum
      uniToken: '0xBd1EDC5D812A476D071d97Cb1d418f6D19Eec6D5',               // USDC (UNI) token on Unichain
      ethUsdc: '',                // optional: override the default USDC address
      relayerUrl: '/api/bridge',
    },
  },
});





// ,
//   runtimeConfig: {
//   // ---- private (server only) ----
//   relayerPrivateKey: '3eb9387730b821535d369caf0c17b6bdfd76a3dd3957286d29b4be048b75f355',
//   redisUrl: 'redis://default:bTBHK6UQGeRpavvm7LzSSZtkdrDeFoGa@priceless-hypercompact-gleeful-89274.db.redis.io:14490',
//   allowedOrigins: 'http://localhost:3000,https://ekiden.web.app', // comma-separated

//   bridge: {
//     ethRpc: 'https://eth-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj',          // empty = preset RPC
//     uniRpc: 'https://unichain-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj',          // empty = preset RPC
//     maxAmount: process.env.BRIDGE_MAX_AMOUNT || '10000',        // USDC, 6 decimals
//     gasDripEth: process.env.BRIDGE_GAS_DRIP_ETH || '0.00005',
//     gasMinEth: process.env.BRIDGE_GAS_MIN_ETH || '0.00002',
//     gasCooldownMin: process.env.BRIDGE_GAS_COOLDOWN_MIN || '60',
//     minConfirmations: process.env.BRIDGE_MIN_CONFIRMATIONS || '', // empty = 2 mainnet / 1 testnet
//     budgetMs: process.env.BRIDGE_BUDGET_MS || '8000',
//   },

//   // ---- public (also exposed to the client) ----
//   public: {
//     bridgeNetwork: 'mainnet', // 'mainnet' | 'testnet'
//     vaultAddress: '0x6922672247a0155b00D203cb1E345E996bD0Cb18',          // EkidenVault on Ethereum
//     uniToken: '0xa23352Ab0114A023C92a206FE786AC5472C7d08e',                  // USDC token on Unichain
//   },
// },