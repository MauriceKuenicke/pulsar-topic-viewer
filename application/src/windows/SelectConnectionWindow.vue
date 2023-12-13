<template>
  <div>
    <h2>Connect to your Pulsar topic</h2>
    <div class="mt-4">
      <CreateConnectionDialog/>
    </div>
    <v-select
        class="mt-6"
        label="Select stored connection"
        no-data-text="No connections found"
        :items="availableConfigurations"
        variant="outlined"
        :return-object="true"
        item-title="name"
        density="compact"
        :loading="false"
        @update:menu="fetchLocalConfigurations"
        v-model="selectedConfiguration"
    >
      <template v-slot:item="{ props, item}">
        <v-list-item v-bind="props">{{generateListEntrySubtitleString(item.raw)}}</v-list-item>
      </template>
    </v-select>

    <div v-if="selectedConfiguration">
      <v-divider class="mt-4"></v-divider>
      <v-row>
        <v-col>
          <h4 class="mt-4">Service</h4>
          <p class="d-inline">{{selectedConfiguration.url}}</p>
          <v-btn icon="mdi-content-copy" variant="plain" size="x-small"
                 class="pb-1" :ripple="false"
                 @click="copyTextToClipBoard(selectedConfiguration.url)"></v-btn>

          <h4 class="mt-4">Topic</h4>
          <p class="d-inline">{{selectedConfiguration.topic}}</p>
          <v-btn icon="mdi-content-copy" variant="plain" size="x-small"
                 class="pb-1" :ripple="false"
                 @click="copyTextToClipBoard(selectedConfiguration.topic)"></v-btn>

          <h4 class="mt-4">Tenant</h4>
          <p class="d-inline">{{selectedConfiguration.tenant}}</p>
          <v-btn icon="mdi-content-copy" variant="plain" size="x-small"
                 class="pb-1" :ripple="false"
                 @click="copyTextToClipBoard(selectedConfiguration.tenant)"></v-btn>

          <h4 class="mt-4">Namespace</h4>
          <p class="d-inline">{{selectedConfiguration.namespace}}</p>
          <v-btn icon="mdi-content-copy" variant="plain" size="x-small"
                 class="pb-1" :ripple="false"
                 @click="copyTextToClipBoard(selectedConfiguration.namespace)"></v-btn>
        </v-col>
        <v-col>
          <div class="w-75 h-100 d-flex flex-column justify-center">
              <v-btn class="mb-2" @click="connectToTopicBroker" :loading="connectionInProgress">Connect</v-btn>
              <v-btn class="mb-2" :disabled="true">Edit</v-btn>
              <v-btn class="mb-2" @click="deleteLocalConfiguration">Delete</v-btn>
          </div>
        </v-col>
      </v-row>


      <v-snackbar v-model="showCopyToClipBoardSnackbar" :timeout="1500" color="green" transition="scroll-x-transition">
        Copy to clipboard successful!
        <template v-slot:actions>
          <v-btn icon="mdi-close" @click="showCopyToClipBoardSnackbar=false" size="x-small">
          </v-btn>
        </template>
      </v-snackbar>
      <v-snackbar v-model="showConnectionErrorSnackbar" :timeout="3000" color="error" transition="scroll-x-transition">
        Can not connect using the selected connection.
        <template v-slot:actions>
          <v-btn icon="mdi-close" @click="showConnectionErrorSnackbar=false" size="x-small">
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import CreateConnectionDialog from "./CreateConnectionDialog.vue";
import { invoke } from "@tauri-apps/api/tauri";
import {ref} from "vue";
import {useRouter} from "vue-router";
import {AuthorizationMethods, IAuthorizationData, IStoredConfig} from "../types"
import { appWindow } from "@tauri-apps/api/window";
import API, {IGetTopicStatsParameter} from "../api"

const router = useRouter()
const availableConfigurations = ref<IStoredConfig[]>([])
const selectedConfiguration = ref<IStoredConfig>()
const showCopyToClipBoardSnackbar = ref<boolean>(false)
const showConnectionErrorSnackbar = ref<boolean>(false)
const connectionInProgress = ref<boolean>(false)

async function fetchLocalConfigurations() {
  availableConfigurations.value = await invoke("read_available_connections");
}

async function deleteLocalConfiguration(){
  if(!selectedConfiguration.value || !selectedConfiguration.value.name){
    return
  }
  const deletion_was_successful: boolean = await invoke("delete_local_configuration",
      {name: selectedConfiguration.value.name});

  if(deletion_was_successful){
    selectedConfiguration.value = undefined
  }
}

function copyTextToClipBoard(text: string): void{
  navigator.clipboard.writeText(text);
  showCopyToClipBoardSnackbar.value = true
}

function generateListEntrySubtitleString(configuration: IStoredConfig): string {
  return `(Topic: ${configuration.topic}, Tenant: ${configuration.tenant}, Namespace: ${configuration.namespace})`
}

function connectToTopicBroker(){
  if (!selectedConfiguration.value) return
  connectionInProgress.value = true

  const connectionParams: IGetTopicStatsParameter = {
    url: selectedConfiguration.value.url, // http://localhost:8080
    tenant: selectedConfiguration.value.tenant, // public
    namespace: selectedConfiguration.value.namespace,  // default
    topic:  selectedConfiguration.value.topic  // my-topic-test-2
  }

  const authData: IAuthorizationData = {
    [AuthorizationMethods.noAuth]: null,
    [AuthorizationMethods.basicAuth]: {
      username: selectedConfiguration.value.auth_creds?.username as string,
      password: selectedConfiguration.value.auth_creds?.password as string
    }
  }

  API.getStatsForTopic(connectionParams, authData, selectedConfiguration.value.auth_method).then((response) => {
    if(response.status !== 200){
      showConnectionErrorSnackbar.value = true
    }
    router.push({ name: "TopicDashboard" })
    connectionInProgress.value = false
    appWindow.toggleMaximize()
  }).catch(() => {
    connectionInProgress.value = false
    showConnectionErrorSnackbar.value = true
  })
}
</script>


<style scoped>
</style>