<template>
  <div class="modal-backdrop" @click="closeOnBackdrop">
    <div class="modal" @click.stop>

      <div class="modal-title">How Polyscore works</div>
      <div class="modal-sub">
        Polyscore looks at public on-chain activity for wallets trading on Polymarket
        and converts it into a 0–100 score. It does not custody funds, request approvals,
        or execute transactions.
      </div>

      <ul class="bullet-list">
        <li>Higher scores reflect consistent trading, diversified markets, and meaningful volume.</li>
        <li>70–100 = High airdrop probability band.</li>
        <li>35–65 = Lukewarm band (~50% chance).</li>
        <li>Below 30 = Minimal on-chain presence, low likelihood.</li>
      </ul>

      <div class="modal-footer-row">
        <span class="link-text" @click="$emit('close')">Back</span>
        <span class="modal-close-button" @click="$emit('close')">Close</span>
      </div>

    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["close"])

function closeOnBackdrop(e) {
  if (e.target.classList.contains("modal-backdrop")) {
    emit("close")
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: #020617;
  border-radius: 18px;
  border: 1px solid #1F2530;
  box-shadow: 0 0 40px rgba(0,0,0,0.85);
  padding: 18px;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #fff;
}

.modal-sub {
  font-size: 12px;
  color: #9CA3AF;
  margin-bottom: 14px;
}

.bullet-list {
  font-size: 12px;
  color: #D1D5DB;
  padding-left: 18px;
  list-style: disc;
  margin-bottom: 18px;
}

.modal-footer-row {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.link-text,
.modal-close-button {
  font-size: 11px;
  color: #9CA3AF;
  cursor: pointer;
  text-decoration: underline;
}
</style>
