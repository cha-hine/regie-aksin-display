<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import pb from '@/lib/pocketbase'
import axios from '@/lib/strapi'
import socket from '@/lib/socket-io'

import HelanesTicker from '@/components/HelanesTicker.vue'
import NamazEvent from '@/components/NamazEvent.vue'
//import SlidesCarousel from '@/components/front/SlidesCarousel.vue'
//import EventsList from '@/components/front/EventsList.vue'
//import NamazTimes from '@/components/front/NamazTimes.vue'

const prayerTimes = ref([
  { name: 'Fajr', time1: '05:30', time2: '05:45' },
  { name: 'Dhuhr', time1: '12:15', time2: '12:30' },
  { name: 'Maghrib', time1: '18:20', time2: '18:25' },
])

const events = ref(['Cours de Coran - Samedi 18h00', 'Conférence islamique - Vendredi'])

const config = ref(null)
const affichage = ref(null)
const helanes = ref([])
const slides = ref([])
//const events = ref([])
const namaz = ref(null)

const loading = ref(true)
const error = ref(null)

const fetchAffichage = async () => {
  const res = await axios.get('/affichage')
  console.log('Affichage fetch:', res.data.data)
  affichage.value = res.data || null
}

const fetchHelanes = async () => {
  // Calculer le début de la journée pour GMT+4
  const now = new Date()

  // Créer une date pour le début de journée en GMT+4
  // GMT+4 = UTC+4, donc minuit GMT+4 = 20:00 UTC la veille
  const startOfDayGMT4 = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }))
  startOfDayGMT4.setHours(0, 0, 0, 0)

  // Convertir en format ISO pour PocketBase
  const startDate = startOfDayGMT4.toISOString().replace('T', ' ').substring(0, 19)

  const res = await axios.get('/helanes')
  console.log('helanes fetch:', res.data)
  helanes.value = res.data || null
}
/*
const fetchSlides = async () => {
  const res = await pb.collection('slides').getList({
    filter: 'etat = true',
    sort: 'created',
  })
  slides.value = res
}

const fetchEvents = async () => {
  const res = await pb.collection('events').getList({
    filter: 'etat = true',
    sort: 'date',
  })
  events.value = res
}

const fetchNamaz = async () => {
  const res = await pb.collection('namaz').getFullList({
    filter: 'etat = true',
    sort: '-date',
  })
  namaz.value = res[0] || null
}
*/
// ✅ Enregistrer les listeners au niveau du script setup
socket.on('connect', () => {
  console.log('[socket] connected', socket.id)
})

socket.on('connect_error', (err) => {
  console.log('[socket] connect_error', err.message, err)
})

socket.on('update:affichage', () => {
  fetchAffichage()
})

onMounted(async () => {
  loading.value = true
  error.value = null

  // Charger les données initiales
  try {
    await Promise.all([fetchAffichage(), fetchHelanes()])
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
})

// ✅ Nettoyer les listeners
onBeforeUnmount(() => {
  socket.off('connect')
  socket.off('connect_error')
  socket.off('update:affichage')
  socket.offAny()
})
</script>

<template>
  <div
    v-if="affichage"
    class="home-view"
    :style="{
      backgroundColor: '#00ff00',
      width: '1920px',
      height: '1080px',
      padding: '0',
      margin: '0',
    }"
  >
    <p v-if="loading">Chargement…</p>
    <p v-if="error" style="color: red">{{ error }}</p>
    <template v-if="!loading && !error">
      <NamazEvent
        v-if="affichage.data.namaz_programme"
        :prayer-times="prayerTimes"
        :events="events"
        :hijri_date="affichage.data.hijri_date"
        :hijri_date_decalage="affichage.data.hijri_date_decalage"
      />
      <HelanesTicker v-if="affichage.data.helane" :data="helanes.data" />

      <!--   <SlidesCarousel
        v-if="config.slides?.enabled !== false"
        :data="slides"
        :config="config.slides"
      />

      <EventsList
        v-if="config.events?.enabled !== false"
        :data="events"
        :config="config.events"
      />

      <NamazTimes
        v-if="config.namaz?.enabled !== false"
        :data="namaz"
        :config="config.namaz"
      /> -->
    </template>
  </div>

  <div v-else-if="!loading">Aucune configuration active.</div>
</template>
