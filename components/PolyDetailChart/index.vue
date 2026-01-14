<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 px-10 pb-20">

    <!-- ACCURACY TREND -->
    <div class="intel-card">
      <div class="intel-title">Prediction Accuracy Trend</div>
      <canvas ref="accuracyChart"></canvas>
    </div>

    <!-- VOLUME FLOW -->
    <div class="intel-card">
      <div class="intel-title">DeFi Capital Flow ($)</div>
      <canvas ref="flowChart"></canvas>
    </div>

    <!-- WEEKLY ACTIVITY -->
    <div class="lg:col-span-2 intel-card">
      <div class="intel-title">Weekly Trading Activity</div>
      <canvas ref="activityChart"></canvas>
    </div>

  </div>
</template>

<script setup>
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, BarController, BarElement } from 'chart.js'
import { onMounted, ref } from 'vue'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, BarController, BarElement)

const accuracyChart = ref(null)
const flowChart = ref(null)
const activityChart = ref(null)

onMounted(() => {

new Chart(accuracyChart.value, {
  type: 'line',
  data: {
    labels: ['W1','W2','W3','W4','W5','W6'],
    datasets: [{
      data: [48,52,55,59,61,62],
      borderColor: '#3D6FFF',
      backgroundColor: 'rgba(61,111,255,0.15)',
      pointBackgroundColor: '#7BA7FF',
      borderWidth: 3,
      tension: 0.45,
      fill: true
    }]
  },
  options: baseOptions('Accuracy %')
})


new Chart(flowChart.value, {
  type: 'line',
  data: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [
      {
        data: [4000,7200,8100,9100,11200,13400],
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34,197,94,0.15)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      },
      {
        data: [1800,2400,3600,4200,4800,6000],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239,68,68,0.12)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }
    ]
  },
  options: baseOptions('USD Volume')
})


new Chart(activityChart.value, {
  type: 'bar',
  data: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      data: [3,5,6,4,8,7,5],
      backgroundColor: 'rgba(123,167,255,0.6)',
      borderColor: '#3D6FFF',
      borderWidth: 2,
      borderRadius: 6
    }]
  },
  options: baseOptions('Trades')
})


function baseOptions(label) {
  return {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#020617',
        borderColor: '#3D6FFF',
        borderWidth: 1,
        titleColor: '#7BA7FF',
        bodyColor: '#E5EDFF'
      }
    },
    scales: {
      x: {
        ticks: { color: '#7BA7FF' },
        grid: { color: 'rgba(61,111,255,0.08)' }
      },
      y: {
        ticks: { color: '#7BA7FF' },
        grid: { color: 'rgba(61,111,255,0.08)' },
        title: {
          display: true,
          text: label,
          color: '#CBD4FF',
          font: { weight: 'bold' }
        }
      }
    }
  }
}
})

</script>

<style scoped>
.intel-card {
  background:#0A0C10;
  border:1px solid #1F2530;
  padding:24px;
  border-radius:16px;
  box-shadow:0 20px 60px rgba(0,0,0,.6);
}
.intel-title {
  font-size:12px;
  letter-spacing:.18em;
  text-transform:uppercase;
  color:#6B7280;
  margin-bottom:16px;
}
</style>
