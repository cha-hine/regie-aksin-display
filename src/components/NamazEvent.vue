<template>
  <div class="prayer-display">
    <div class="clock-section">
      <div class="digital-time">{{ formattedTime }}</div>
      <div class="date-display">{{ formattedDate }}</div>
    </div>

    <div class="prayer-times">
      <h2>🕌 Horaires de Prière</h2>
      <div class="prayer-table">
        <div
          v-for="prayer in prayerTimes"
          :key="prayer.name"
          class="prayer-card"
          :class="{ active: isCurrentPrayer(prayer.time1, prayer.time2) }"
        >
          <div class="prayer-name-header">{{ prayer.name }}</div>
          <div class="prayer-times-row">
            <div class="prayer-time-cell">
              <div class="time-value">{{ prayer.time1 }}</div>
            </div>
            <div class="prayer-time-cell">
              <div class="time-value">{{ prayer.time2 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="events-section" v-if="events.length > 0">
      <h3>📅 Événements</h3>
      <div v-for="(event, index) in events" :key="index" class="event-item">
        {{ event }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  prayerTimes: {
    type: Array,
    required: true,
    default: () => [],
  },
  events: {
    type: Array,
    default: () => [],
  },
})

const currentTime = ref(new Date())
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
let interval = null

const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const updateTime = () => {
  currentTime.value = new Date()
  hours.value = currentTime.value.getHours() % 12
  minutes.value = currentTime.value.getMinutes()
  seconds.value = currentTime.value.getSeconds()
}

const isCurrentPrayer = (time1, time2) => {
  const now = currentTime.value
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const [hrs1, mins1] = time1.split(':').map(Number)
  const time1Minutes = hrs1 * 60 + mins1

  const [hrs2, mins2] = time2.split(':').map(Number)
  const time2Minutes = hrs2 * 60 + mins2

  return (
    Math.abs(currentMinutes - time1Minutes) < 30 || Math.abs(currentMinutes - time2Minutes) < 30
  )
}

onMounted(() => {
  updateTime()
  interval = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<style scoped>
.prayer-display {
  z-index: 10;
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 575px;
  height: 1080px;
  max-height: 100vh;
  background-color: #e9dead;
  border-radius: 20px 0 0 20px;
  box-shadow: -10px 0 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  padding: 40px 30px;
  color: white;
  z-index: 1000;
  overflow-y: auto;
}

.clock-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.digital-time {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #000000;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.date-display {
  font-size: 20px;
  color: #000000;
  margin-bottom: 20px;
}

.prayer-times {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.prayer-times h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #000000;
  font-size: 28px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.prayer-table {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.prayer-card {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.prayer-card:hover {
  transform: translateX(-5px);
  border-color: rgba(0, 0, 0, 0.4);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.prayer-card.active {
  border-color: #ff4757;
  box-shadow: 0 0 25px rgba(255, 71, 87, 0.4);
  background: rgba(255, 71, 87, 0.2);
}

.prayer-name-header {
  background: rgba(0, 0, 0, 0.15);
  padding: 12px;
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  color: #000000;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
}

.prayer-card.active .prayer-name-header {
  background: rgba(255, 71, 87, 0.3);
  color: #ff4757;
  border-bottom-color: #ff4757;
}

.prayer-times-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.prayer-time-cell {
  padding: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.prayer-time-cell:first-child {
  border-right: 1px solid rgba(0, 0, 0, 0.2);
}

.time-value {
  font-size: 26px;
  color: #000000;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.prayer-card.active .time-value {
  color: #ff4757;
  text-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
}

.events-section {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.events-section h3 {
  text-align: center;
  margin-bottom: 15px;
  color: #ff4757;
  font-size: 24px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.event-item {
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(255, 71, 87, 0.2);
  border-radius: 8px;
  border-left: 3px solid #ff4757;
  font-size: 16px;
  color: #000000;
}

.event-item:last-child {
  margin-bottom: 0;
}

.events-section::-webkit-scrollbar {
  width: 6px;
}

.events-section::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.events-section::-webkit-scrollbar-thumb {
  background: #ff4757;
  border-radius: 10px;
}
</style>
