<template>
  <div>
    <h1>
      Dashboard (my-topic-test-2)
    </h1>
    <v-btn @click="disconnect" class="mt-4">
      Disconnect
    </v-btn>

    <v-row class="mt-4">
      <v-col sm="6" md="4">
        <v-card class="w-100" height="150" rounded>
          <div class="w-100 pa-4 pt-6 h-100">
            <p class="text-center text-h3">{{ messageInCounter }}</p>
            <p class="text-center">Total messages received</p>
            <p class="text-center mt-1 text-subtitle-2">This corresponds to a total of {{ bytesInCounter }} bytes received.</p>
          </div>
        </v-card>
      </v-col>
      <v-col sm="6" md="4">
        <v-card class="w-100" height="150" rounded>
          <div class="w-100 pa-4 pt-6 h-100">
            <p class="text-center text-h3">{{ messageOutCounter }}</p>
            <p class="text-center">Total messages send out</p>
            <p class="text-center mt-1 text-subtitle-2">This corresponds to a total of {{ bytesOutCounter }} bytes send out.</p>
          </div>
        </v-card>
      </v-col>
      <v-col sm="12" md="4">
        <v-card class="w-100" height="150" rounded>
          <div class="w-100 pa-4 pt-6 h-100">
            <p class="text-center text-h3">{{ backlogSize }}</p>
            <p class="text-center text-subtitle-2">Messages in backlog</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-5">
      <v-col id="chart" sm="12" md="6">
        <apexchart type="line" height="350" :options="config" :series="series"></apexchart>
      </v-col>
      <v-col id="chart" sm="12" md="6">
        <apexchart type="line" height="350" :options="configOut" :series="messageRateOutSeries"></apexchart>
      </v-col>
    </v-row>


<!--    <div class="mt-5">-->
<!--      {{topicData}}-->
<!--    </div>-->
  </div>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {appWindow} from "@tauri-apps/api/window";
import {ref, onMounted, onUnmounted} from "vue"
import API, {IGetTopicStatsParameter} from "../api.ts";
import {AuthorizationMethods, IAuthorizationData} from "../types.ts";

const router = useRouter()
const refreshIntervalInSeconds = 0.5

const series = ref<any[]>([])
const messageRateOutSeries = ref<any[]>([])
const messageRateOutArray = ref<number[]>([])
const topicData = ref<object>()
const refreshIntervalID = ref<number>()

const messageInCounter = ref<number>()
const bytesInCounter = ref<number>()
const bytesOutCounter = ref<number>()
const messageOutCounter = ref<number>()
const messageRateInArray = ref<number[]>([])
const backlogSize = ref<number>()
const rollingAverageMessageRateIn = ref<number[]>([])
const timestampArray = ref<number[]>([])


const config = ref({
  theme: {
    mode: "dark",
    palette: "palette1"
  },
  chart: {
    height: 350,
    type: 'line',
    zoom: {
      enabled: false
    },
    stacked: false,
    animations: {
      enabled: true,
      easing: 'linear',
      dynamicAnimation: {
        speed: 1000
      }
    },
    toolbar: {
      show: false
    },
  },
  stroke: {
    width: [1, 3],
    dashArray: [2, 0]
  },
  title: {
    text: 'Current Message Rate IN',
  },
  legend: {
    show: true,
  },
  noData: {
    text: 'Loading...'
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    type: 'datetime',
    categories: timestampArray.value,
    labels: {
      datetimeFormatter: {
        year: 'yyyy',
        month: 'MMM \'yy',
        day: 'dd MMM',
        hour: 'HH:mm'
      }
    }
  }
})

const configOut = ref({
  theme: {
    mode: "dark",
    palette: "palette1"
  },
  chart: {
    height: 350,
    type: 'line',
    zoom: {
      enabled: false
    },
    stacked: false,
    animations: {
      enabled: true,
      easing: 'linear',
      dynamicAnimation: {
        speed: 1000
      }
    },
    toolbar: {
      show: false
    },
  },
  stroke: {
    width: [1, 3],
    // curve: 'smooth',
    dashArray: [2, 0]
  },
  title: {
    text: 'Current Message Rate OUT',
  },
  legend: {
    show: true,
  },
  colors: ["#eb7434", "#2da645"],
  noData: {
    text: 'Loading...'
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    type: 'datetime',
    categories: timestampArray.value,
    labels: {
      datetimeFormatter: {
        year: 'yyyy',
        month: 'MMM \'yy',
        day: 'dd MMM',
        hour: 'HH:mm'
      }
    }
  }
})

onMounted(()=> {
  refreshIntervalID.value = setInterval(loadTopicData, refreshIntervalInSeconds*1000)
  loadTopicData()
  setTimeout(() => {
    series.value = [{
        name: 'Current Message Rate',
        data: messageRateInArray.value
    },
      {
        name: 'Average',
        data: rollingAverageMessageRateIn.value
      }]

    messageRateOutSeries.value = [
      {
        name: 'Current Message Rate',
        data: messageRateOutArray.value
      },
      {
        name: 'Average',
        data: rollingAverageMessageRateIn.value
      }
    ]
  }, 1000)
})

onUnmounted(()=>{
  clearInterval(refreshIntervalID.value)
})

function loadTopicData(){
  const connectionParams: IGetTopicStatsParameter = {
    url: "http://localhost:8080",
    tenant: "public",
    namespace: "default",
    topic:  "my-topic-test-2",
  }

  const authData: IAuthorizationData = {
    [AuthorizationMethods.noAuth]: null,
    [AuthorizationMethods.basicAuth]: {
      username: "superuser",
      password: "admin"
    }
  }

  API.getStatsForTopic(connectionParams, authData, AuthorizationMethods.basicAuth).then(({data}) => {
    topicData.value = data as object
    const loadTimestamp = Date.now()
    timestampArray.value.push(loadTimestamp)

    let oldMessageCount = messageInCounter.value
    const currentMessageCount = data["msgInCounter"] as number
    messageOutCounter.value = data["msgOutCounter"]
    bytesInCounter.value = data["bytesInCounter"]
    bytesOutCounter.value = data["bytesOutCounter"]
    backlogSize.value = data["backlogSize"]

    if (!oldMessageCount) {
      oldMessageCount = currentMessageCount
    }
    messageInCounter.value = currentMessageCount
    const messageRate = (currentMessageCount-oldMessageCount)/refreshIntervalInSeconds
    messageRateInArray.value.push(parseFloat(messageRate.toFixed(2)))

    const messageOutRate = (messageOutCounter.value-oldMessageCount)/refreshIntervalInSeconds
    messageRateOutArray.value.push(parseFloat(messageOutRate.toFixed(2)))

    let sum = messageRateInArray.value.reduce((a, b) => a+b, 0)
    let average = sum / messageRateInArray.value.length;
    rollingAverageMessageRateIn.value.push(parseFloat(average.toFixed(2)))
  })
}


function disconnect(): void{
  router.push({name: "SelectConnectionWindow"})
  appWindow.unmaximize()
}
</script>


<style scoped>

</style>