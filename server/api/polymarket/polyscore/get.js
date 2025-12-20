// server/api/polyscore.get.ts
import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { wallet } = getQuery(event)
  
  if (!wallet) {
    throw createError({ statusCode: 400, message: 'Wallet address required' })
  }

  try {
    // Fetches profile data which includes the "Smart Money Score"
    const response = await $fetch(`https://www.polywhaler.com/api/whale-profile/${wallet}?refresh=false`)
    return response
  } catch (err) {
    throw createError({ statusCode: 404, message: 'Wallet not found or API error' })
  }
})