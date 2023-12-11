<template>
  <div>
    <h1>
      Dashboard Incoming
    </h1>
    <v-btn @click="disconnect" class="mt-4">
      Disconnect
    </v-btn>

    <div id="chart">
      <apexchart type="line" height="350" :options="config" :series="series"></apexchart>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {appWindow} from "@tauri-apps/api/window";
import {ref, onMounted} from "vue"

const router = useRouter()

const series = ref<any[]>([])

const config = ref({
  theme: {
    mode: "dark",
    palette: "palette2"
  },
  chart: {
    height: 350,
    type: 'line',
    stacked: false
  },
  title: {
    text: 'Ajax Example',
  },
  noData: {
    text: 'Loading...'
  }
})

onMounted(()=> {
  setTimeout(() => {
    series.value = [{
        name: 'Income',
        type: 'column',
        data: [1.4, 2, 2.5, 1.5, 2.5, 2.8, 3.8, 4.6]
      }, {
        name: 'Cashflow',
        type: 'column',
        data: [1.1, 3, 3.1, 4, 4.1, 4.9, 6.5, 8.5]
      }, {
        name: 'Revenue',
        type: 'line',
        data: [20, 29, 37, 36, 44, 45, 50, 58]
    }]
  }, 1000)
})


function disconnect(): void{
  router.push({name: "SelectConnectionWindow"})
  appWindow.unmaximize()
}
</script>


<style scoped>

</style>