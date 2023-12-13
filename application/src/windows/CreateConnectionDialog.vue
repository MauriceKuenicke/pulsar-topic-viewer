<template>
  <v-dialog v-model="showCreateConnectionDialog"
            :persistent="true"
            width="800px"
            height="800px"
            scrim="black"
            :no-click-animation="true">
    <template v-slot:activator="{props: dialogProps}">
      <v-btn v-bind="{...dialogProps}" variant="outlined" size="small" >
        Create new Connection
      </v-btn>
    </template>

    <v-card>
      <v-form @submit.prevent :v-model="formValid">
        <v-card-title>Create Connection</v-card-title>
        <v-card-text>
          <v-text-field label="Connection Name"
                        variant="underlined"
                        v-model="newConnectionForm.name" :rules="[isRequired, noSpecialCharacters]"></v-text-field>
          <v-text-field label="Service URL" variant="underlined"
                        v-model="newConnectionForm.url" :rules="[isRequired]"></v-text-field>
          <v-row>
            <v-col><v-text-field label="Tenant" variant="underlined" v-model="newConnectionForm.tenant" :rules="[isRequired]"></v-text-field></v-col>
            <v-col><v-text-field label="Namespace" variant="underlined" v-model="newConnectionForm.namespace" :rules="[isRequired]"></v-text-field></v-col>
            <v-col><v-text-field label="Topic" variant="underlined" v-model="newConnectionForm.topic" :rules="[isRequired]"></v-text-field></v-col>
          </v-row>

          <v-row class="mt-3">
            <v-col sm="6" md="4">
              <v-radio-group label="Select authorization method" v-model="newConnectionForm.auth">
                <v-radio :label="AuthorizationMethods.noAuth" :value="AuthorizationMethods.noAuth"></v-radio>
                <v-radio :label="AuthorizationMethods.basicAuth" :value="AuthorizationMethods.basicAuth"></v-radio>
              </v-radio-group>
            </v-col>
            <v-divider :thickness="2" :vertical="true"></v-divider>
            <v-scroll-x-transition :hide-on-leave="true">
              <v-col v-if="newConnectionForm.auth == AuthorizationMethods.noAuth" transition="scroll-x-transition">
                <p>No input required.</p>
              </v-col>
              <v-col v-if="newConnectionForm.auth == AuthorizationMethods.basicAuth" transition="scroll-x-transition">
                <v-text-field label="Username" variant="underlined"
                              v-model="newConnectionForm.username" :rules="[isRequired]"></v-text-field>
                <v-text-field label="Password" variant="underlined"
                              type="password" v-model="newConnectionForm.password" :rules="[isRequired]"></v-text-field>
              </v-col>
            </v-scroll-x-transition>
          </v-row>

          <v-row class="w-100 mt-6 mb-1">
            <v-btn variant="outlined" size="small" @click="testConnectivity" :loading="testInProgress" :disabled="!formValid">
              Test connection
            </v-btn>
            <v-btn variant="outlined" size="small" class="ml-4" @click="saveConfig" :disabled="!formValid">
              Save connection
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn variant="outlined" size="small" class="ml-4" @click="showCreateConnectionDialog=false">
              Cancel
            </v-btn>
          </v-row>

          <v-slide-x-reverse-transition>
          <div class="alert-container" v-if="showConnectivityTestResultAlert">
            <v-alert
                v-model="showConnectivityTestResultAlert"
                :type="connectionTestError ? 'error' : 'success'"
                density="compact"
                :closable="true"
                :title="connectionTestError ? 'Connection Test Failed' : 'Connection Test Successful'"
                :text="connectionTestError ? connectionTestError: ''"
            ></v-alert>
          </div>
          </v-slide-x-reverse-transition>
        </v-card-text>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {ref, computed} from "vue"
import API, {IGetTopicStatsParameter} from "../api"
import {AuthorizationMethods, IAuthorizationData, IStoredConfig} from "../types"
import { invoke } from "@tauri-apps/api/tauri";
import {isRequired, noSpecialCharacters} from "../formValidation"


// ============================
// LOCAL INTERFACES
interface INewConnectionForm{
  name: string
  url: string
  tenant: string
  namespace: string
  topic: string
  auth: AuthorizationMethods
  username?: string
  password?: string
}
// ============================

// ============================
// INIT REACTIVITY
const showCreateConnectionDialog = ref<boolean>(false)
const showConnectivityTestResultAlert = ref<boolean>(false)
const connectionTestError = ref<string>()
const testInProgress = ref<boolean>(false)
const defaultConnectionFormEntries: INewConnectionForm = {
  name: "",
  url: "",
  tenant: "",
  namespace: "",
  topic: "",
  auth: AuthorizationMethods.noAuth
}
const newConnectionForm = ref<INewConnectionForm>(JSON.parse(JSON.stringify(defaultConnectionFormEntries)))
// ============================

function restoreDefaults(){
  showConnectivityTestResultAlert.value = false
  connectionTestError.value = undefined
  testInProgress.value = false
  newConnectionForm.value = JSON.parse(JSON.stringify(defaultConnectionFormEntries))
  showCreateConnectionDialog.value = false
}

const formValid = computed(()=> {
  const formValues = newConnectionForm.value
  return !(
      !formValues.name || !formValues.url || !formValues.auth || !formValues.tenant ||
      !formValues.namespace || !formValues.topic ||
      (formValues.auth == AuthorizationMethods.basicAuth && (!formValues.username || !formValues.password))
  )
})

async function testConnectivity(){
  const parameter: IGetTopicStatsParameter = {
    url: newConnectionForm.value.url, // http://localhost:8080
    tenant: newConnectionForm.value.tenant, // public
    namespace: newConnectionForm.value.namespace,  // default
    topic:  newConnectionForm.value.topic  // my-topic-test-2
  }

  // Create full authorization data object from form
  const authData: IAuthorizationData = {
    [AuthorizationMethods.noAuth]: null,
    [AuthorizationMethods.basicAuth]: {
      username: newConnectionForm.value.username as string,
      password: newConnectionForm.value.password as string
    }
  }

  await sendRequestAndValidate(parameter, authData, newConnectionForm.value.auth)
}

async function sendRequestAndValidate(parameter: IGetTopicStatsParameter,
                                      authData:IAuthorizationData,
                                      authMethod:AuthorizationMethods){
  showConnectivityTestResultAlert.value = false
  testInProgress.value = true
  connectionTestError.value = undefined

  API.getStatsForTopic(parameter, authData, authMethod).then((response) => {
    if(response.status != 200){
      connectionTestError.value = "Could not authenticate with requested Pulsar broker."
      showConnectivityTestResultAlert.value = true
      testInProgress.value = false
    }
  }).catch((e) => {
    console.log(e)
    connectionTestError.value = "Something went wrong."
    showConnectivityTestResultAlert.value = true
    testInProgress.value = false
  })
}

async function saveConfig(){
  const config: IStoredConfig = {
    url: newConnectionForm.value.url,
    tenant: newConnectionForm.value.tenant,
    namespace: newConnectionForm.value.namespace,
    topic:  newConnectionForm.value.topic,
    name: newConnectionForm.value.name,
    auth_method: newConnectionForm.value.auth
  }

  if(newConnectionForm.value.auth == AuthorizationMethods.basicAuth){
    config["auth_creds"] = {
      "username": newConnectionForm.value.username,
      "password": newConnectionForm.value.password,
    }
  }

  const save_was_successful = await invoke("write_to_conf_file", {data: config});
  if(save_was_successful){
    restoreDefaults()
  }
}

</script>


<style scoped>
.alert-container {
  position: fixed;
  right: 0;
  top: 4%;
}
</style>