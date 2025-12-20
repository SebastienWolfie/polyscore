import { defineEventHandler, getQuery, createError } from 'file:///Users/icon/ico/polyscore/node_modules/h3/dist/index.mjs';

const get = defineEventHandler(async (event) => {
  const { wallet } = getQuery(event);
  if (!wallet) {
    throw createError({ statusCode: 400, message: "Wallet address required" });
  }
  try {
    const response = await $fetch(`https://www.polywhaler.com/api/whale-profile/${wallet}?refresh=false`);
    return response;
  } catch (err) {
    throw createError({ statusCode: 404, message: "Wallet not found or API error" });
  }
});

export { get as default };
//# sourceMappingURL=get.mjs.map
