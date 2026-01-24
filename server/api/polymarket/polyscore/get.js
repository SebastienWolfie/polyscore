import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { wallet } = getQuery(event)

  if (!wallet || typeof wallet !== 'string') {
    throw createError({ statusCode: 400, message: 'Wallet required' })
  }

  try {
    const res = await $fetch('https://www.polywhaler.com/api/wallet-trades', {
      params: { wallet, limit: 100 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MyNuxtApp/1.0)'
      },
      timeout: 20000 // Reduced to 20s to stay under most serverless limits
    })

    if (!res) {
      return {
        wallet,
        username: `${wallet.slice(0, 6)}…${wallet.slice(-4)}`,
        smartMoneyScore: 12,
        stats: { totalTrades: 0, totalVolume: 0, winRate: 0 }
      }
    }

    const trades = res.trades || []
    const stats = res.stats || {}
    const traderInfo = res.traderInfo || {}

    const marketPnL = {}
    const realizedMarkets = new Set()

    for (const t of trades) {
      const marketId = t.conditionId || t.marketId || 'unknown'
      if (!marketPnL[marketId]) marketPnL[marketId] = 0

      const amount = Number(t.size || 0)
      const price = Number(t.price || 0)
      const tradeValue = amount * price

      if (t.side === 'BUY') {
        marketPnL[marketId] -= tradeValue
      } else if (t.side === 'SELL') {
        marketPnL[marketId] += tradeValue
        realizedMarkets.add(marketId) // They sold, so we can judge the result
      }

      if (t.payout && Number(t.payout) > 0) {
        marketPnL[marketId] += Number(t.payout)
        realizedMarkets.add(marketId) // Market resolved
      }
    }

    // Filter: Only look at markets where the user actually exited or finished
    const finishedPnLs = Object.keys(marketPnL)
      .filter(id => realizedMarkets.has(id))
      .map(id => marketPnL[id])

    const winningMarkets = finishedPnLs.filter(pnl => pnl > 0).length
    
    // Logic: If no markets are finished, we don't say 0% (which looks bad).
    // We use a baseline or wait for more data.
    let winRate = finishedPnLs.length > 0
      ? Math.round((winningMarkets / finishedPnLs.length) * 100)
      : 0

    // Small wallet adjustment (as per your original intent)
    if (trades.length > 0 && winRate === 0 && finishedPnLs.length < 3) {
      winRate = 23 
    }

    const totalTrades = Number(stats.totalTrades || trades.length)
    const totalVolume = Number(stats.totalVolume || 0)

    // Score Calculation
    const volumeScore = Math.log10(totalVolume + 1) * 10
    const frequencyScore = Math.log10(totalTrades + 1) * 5
    const scoreBase = volumeScore + frequencyScore + (winRate / 5)
    const smartMoneyScore = Math.min(100, Math.max(15, Math.round(scoreBase)))

    return {
      wallet,
      username: traderInfo.name || traderInfo.pseudonym || `${wallet.slice(0, 6)}…${wallet.slice(-4)}`,
      smartMoneyScore,
      stats: {
        totalTrades,
        totalVolume: parseFloat(totalVolume.toFixed(2)),
        winRate
      }
    }
  } catch (err) {
    // Check if it's a 404 or a 500 from the external API
    console.error("External API Error:", err.response?.status, err.message)
    
    throw createError({ 
      statusCode: 502, 
      message: 'Failed to fetch data from Polywhaler' 
    })
  }
})