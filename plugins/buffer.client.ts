import { Buffer } from 'buffer'

export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined') {
    // Attach Buffer globally for Solana libraries
    // @ts-ignore
    window.Buffer = Buffer
  }
})
