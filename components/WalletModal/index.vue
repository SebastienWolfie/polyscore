<template>
  <div class="modal-backdrop" @click="closeOnBackdrop">
    <div class="modal" @click.stop>
      <div class="modal-title">Connect wallet on Polymarket</div>
      <div class="modal-sub">
        Use the same on-chain wallet you trade with on Polymarket to sync your Polyscore report.
      </div>

      <div class="wallet-options">
        <button class="wallet-button">
          <span class="label"><span>🦊</span><span>MetaMask</span></span>
          <span class="type">Browser</span>
        </button>

        <button class="wallet-button">
          <span class="label"><span>📱</span><span>WalletConnect</span></span>
          <span class="type">Mobile / QR</span>
        </button>

        <button class="wallet-button">
          <span class="label"><span>💼</span><span>Coinbase Wallet</span></span>
          <span class="type">Multi-chain</span>
        </button>
      </div>

      <div class="modal-footer-row">
        <span class="link-text" @click="$emit('open-learn')">Learn how Polyscore works</span>
        <span class="modal-close-button" @click="$emit('close')">Close</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close', 'open-learn'])

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

.wallet-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wallet-button {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #1F2937;
  background: #0A0C10;
  color: #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  cursor: pointer;
}

.wallet-button:hover {
  border-color: #3D6FFF;
}

.label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type {
  font-size: 11px;
  color: #6B7280;
}

.modal-footer-row {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
}

.link-text {
  font-size: 11px;
  color: #9CA3AF;
  text-decoration: underline;
  cursor: pointer;
}

.modal-close-button {
  font-size: 11px;
  color: #9CA3AF;
  cursor: pointer;
}
</style>
