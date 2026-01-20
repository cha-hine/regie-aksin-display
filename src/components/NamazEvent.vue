<template>
  <div class="prayer-display">
    <div class="clock-section">
      <div class="digital-time">{{ formattedTime }}</div>
      <div class="date-display">{{ formattedDate }}</div>
      <div v-if="props.hijri_date" class="date-display">{{ hijriDate }}</div>
    </div>
    <div class="prayer-times">
      <!-- <h2>NAMAZ TIME</h2> -->
      <div class="prayer-table">
        <div v-for="prayer in prayerTimes" :key="prayer.name" class="prayer-card">
          <div class="prayer-name-header">{{ prayer.name }}</div>
          <div class="prayer-times-row">
            <div class="prayer-time-cell">
              <div class="time-value">
                <p class="time-title">Awwal Time</p>
                {{ prayer.time1 }}
              </div>
            </div>
            <div class="prayer-time-cell">
              <div class="time-value">
                <p class="time-title">Jamat</p>
                {{ prayer.time2 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="events-section" v-if="events.length > 0">
      <h3>📅 Programme a venir</h3>
      <div v-for="(event, index) in events" :key="index" class="event-item">
        {{ event }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  hijri_date: {
    type: Boolean,
    default: false,
  },
  hijri_date_decalage: {
    type: Number,
    default: 0,
  },
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

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi Al-Awwal',
  'Rabi Al-Thani',
  'Jamaadi Al-Awwal',
  'Jamaadi Al-Thani',
  'Rajab',
  "Sha'baan",
  'Ramadhân',
  'Shawwal',
  'Zilkaad',
  'Zilhajj',
]

const gregorianDate = ref('')
const hijriDate = ref('')

const getHijriDate = (offsetDays = 0) => {
  let date = new Date()
  if (offsetDays !== 0) {
    date.setDate(date.getDate() + offsetDays)
  }

  let day = date.getDate()
  let month = date.getMonth()
  let year = date.getFullYear()

  if (year < 1900) year += 1900

  let m = month + 1
  let y = year
  if (m < 3) {
    y -= 1
    m += 12
  }

  let a = Math.floor(y / 100)
  let b = 2 - a + Math.floor(a / 4)
  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5

  let z = jd + 0.5
  let cyc = Math.floor((z - 1948440) / 10631)
  let rem = (z - 1948440) % 10631
  let j = Math.floor((rem - 1) / 354.36667)
  let r = Math.floor(rem - j * 354.36667 + 0.5)

  let hYear = cyc * 30 + j + 1
  let hMonth = Math.floor((r - 1) / 29.5) + 1
  let hDay = Math.floor(r - (hMonth - 1) * 29.5 + 0.5)

  if (hDay === 0) {
    hMonth -= 1
    hDay = 30
  }
  if (hMonth > 12) {
    hMonth = 12
  }

  return {
    day: hDay,
    monthName: HIJRI_MONTHS[hMonth - 1],
    year: hYear,
    full: `${hDay} ${HIJRI_MONTHS[hMonth - 1]} ${hYear}`,
  }
}

const updateDates = () => {
  // Date Grégorienne
  const now = new Date()
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  gregorianDate.value = now.toLocaleDateString('fr-FR', options)

  // Date Hijri avec le décalage actuel
  const hijri = getHijriDate(props.hijri_date_decalage)
  hijriDate.value = hijri.full
}

// Watcher pour surveiller les changements de hijri_date_decalage
watch(
  () => props.hijri_date_decalage,
  () => {
    updateDates()
  },
)

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

const islamicDate = computed(() => {
  return new Intl.DateTimeFormat('fr-FR-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(Date.now())
})

onMounted(() => {
  updateDates()
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
  font-family: 'Calibri';
  z-index: 1;
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 575px;
  height: 1080px;
  max-height: 100vh;
  background-color: #e9dead;
  /*   border-radius: 20px 0 0 20px;
 */ /* box-shadow: -10px 0 60px rgba(0, 0, 0, 0.5); */
  display: flex;
  flex-direction: column;
  padding: 40px 30px;
  color: white;
  z-index: 1;
  overflow-y: auto;
}

.clock-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.digital-time {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 0;
  color: #000000;
}

.date-display {
  font-size: 26px;
  color: #000000;
  margin-bottom: 0;
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
  font-weight: 900;
  margin: 0 0 30px 0;
  color: #000000;
  font-size: 50px;
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

.prayer-name-header {
  background: rgba(0, 0, 0, 0.15);
  padding: 5px;
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  color: #000000;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
}

.prayer-times-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.prayer-time-cell {
  padding: 10px;
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
  font-size: 42px;
  color: #000000;
  font-weight: 800;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.time-title {
  font-size: 16px;
  margin: 0;
  padding: 0;
}

.events-section {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.events-section h3 {
  text-align: center;
  margin: 0 0 20px 0;
  color: #4750ff;
  font-size: 32px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.event-item {
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(92, 71, 255, 0.2);
  border-radius: 8px;
  border-left: 3px solid #5947ff;
  font-size: 24px;
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
