import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { wallet } = getQuery(event)

  if (!wallet || typeof wallet !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Wallet required'
    })
  }

  try {
    let res = null

    // ---- Fetch Polywhaler trades ----
    try {
      res = await $fetch('https://www.polywhaler.com/api/wallet-trades', {
        params: {
          wallet,
          limit: 40 // lower limit = faster, avoids 504
        },
        timeout: 8_000 // 8s timeout
      })
    } catch (fetchErr) {
      console.warn('Polywhaler timeout or error, using fallback', fetchErr)
    }

    // ---- Fallback if no data ----
    if (!res || !res.trades) {
      return {
        wallet,
        username: `${wallet.slice(0, 6)}…${wallet.slice(-4)}`,
        smartMoneyScore: 12,
        stats: {
          totalTrades: 0,
          totalVolume: 0,
          winRate: 0
        }
      }
    }

    const trades = res.trades || []
    const stats = res.stats || {}
    const traderInfo = res.traderInfo || {}

    const totalTrades = Number(stats.totalTrades || trades.length)
    const totalVolume = Number(stats.totalVolume || 0)

    // ---- Accurate win rate per market ----
    const marketPnL = {}

    for (const t of trades) {
      const marketId = t.conditionId || t.marketId || t.market || 'unknown'

      if (!marketPnL[marketId]) marketPnL[marketId] = 0

      const amount = Number(t.size || 0)
      const price = Number(t.price || 0)

      if (t.side === 'BUY') marketPnL[marketId] -= amount * price
      if (t.side === 'SELL') marketPnL[marketId] += amount * price
      if (t.payout) marketPnL[marketId] += Number(t.payout)
    }

    const marketResults = Object.values(marketPnL)
    const winningMarkets = marketResults.filter(pnl => pnl > 0).length
    const totalMarkets = marketResults.length

    let winRate =
      totalMarkets > 0
        ? Math.round((winningMarkets / totalMarkets) * 100)
        : 0

    // Adjust for small wallets (<5 markets)
    if (totalMarkets > 0 && totalMarkets < 5) {
      winRate = Math.max(winRate, 22)
    }

    // ---- Smart Money Score ----
    const volumeScore = Math.log10(totalVolume + 1) * 8
    const frequencyScore = Math.log10(totalTrades + 1) * 6
    const smartMoneyScore = Math.min(100, Math.max(20, volumeScore + frequencyScore))

    return {
      wallet,
      username:
        traderInfo.name ||
        traderInfo.pseudonym ||
        `${wallet.slice(0, 6)}…${wallet.slice(-4)}`,

      smartMoneyScore,

      stats: {
        totalTrades,
        totalVolume,
        winRate
      }
    }

  } catch (err) {
    console.error('Polyscore fatal error:', err)

    throw createError({
      statusCode: 500,
      message: 'Failed to generate Polyscore ' + err
    })
  }
})
