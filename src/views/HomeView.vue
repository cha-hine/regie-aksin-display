<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import pb from '@/lib/pocketbase'

import HelanesTicker from '@/components/front/HelanesTicker.vue'
//import SlidesCarousel from '@/components/front/SlidesCarousel.vue'
//import EventsList from '@/components/front/EventsList.vue'
//import NamazTimes from '@/components/front/NamazTimes.vue'

const config = ref(null)
const helanes = ref([])
const slides = ref([])
const events = ref([])
const namaz = ref(null)

const loading = ref(true)
const error = ref(null)

const fetchConfig = async () => {
  const res = await pb.collection('Configs').getFirstListItem('etat = true')
  config.value = res.data || null
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

  const res = await pb.collection('Helanes').getList(1, 50, {
    filter: `etat = true && created >= "${startDate}"`,
  })
  console.log('Helanes fetch:', res)
  helanes.value = res.items
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
onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    await Promise.all([
      fetchConfig(),
      fetchHelanes() /*, fetchSlides(), fetchEvents(), fetchNamaz()*/,
    ])

    pb.collection('Configs').subscribe('*', fetchConfig)
    pb.collection('Helanes').subscribe('*', fetchHelanes)
    //pb.collection('slides').subscribe('*', fetchSlides)
    //pb.collection('events').subscribe('*', fetchEvents)
    //pb.collection('namaz').subscribe('*', fetchNamaz)
  } catch (e) {
    error.value = e?.message || 'Erreur de chargement des données'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  pb.collection('Configs').unsubscribe('*')
  pb.collection('Helanes').unsubscribe('*')
  // pb.collection('slides').unsubscribe('*')
  // pb.collection('events').unsubscribe('*')
  // pb.collection('namaz').unsubscribe('*')
})
</script>

<template>
  <div
    v-if="config"
    class="home-view"
    :style="{
      backgroundColor: config.layout?.background || '#000000',
      color: config.layout?.text || '#ffffff',
      width: '1920px',
      height: '1080px',
      padding: '0',
      margin: '0',
    }"
  >
    <p v-if="loading">Chargement…</p>
    <p v-if="error" style="color: red">{{ error }}</p>
    <template v-if="!loading && !error">
      <HelanesTicker v-if="config.Helane?.etat" :data="helanes" :config="config.Helane" />

      <!--       <SlidesCarousel
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
