import {fetch, ResponseType, FetchOptions} from "@tauri-apps/api/http"
import {AuthorizationMethods, IAuthorizationData} from "./types";


export interface IGetTopicStatsParameter {
    tenant: string
    namespace: string
    topic: string
    url: string
}

export interface IFetchRequestHeaders {
    Accept: string
    "Content-Type": string
    Authorization?: string
}

function generateAuthHeader(authData: IAuthorizationData, authMethod: AuthorizationMethods): IFetchRequestHeaders{
    const headers: IFetchRequestHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json"
    }

    if(authMethod === AuthorizationMethods.basicAuth){
        const basicAuthData = authData[AuthorizationMethods.basicAuth];
        if(!basicAuthData || !basicAuthData.username || !basicAuthData.password){
            throw new Error("Username and password are required for basic authentication");
        }
        headers['Authorization'] = 'Basic ' + btoa(`${basicAuthData.username}:${basicAuthData.password}`);
    }

    return headers
}


export default {
    getStatsForTopic(topicParameter: IGetTopicStatsParameter,
                     authData: IAuthorizationData,
                     authMethod: AuthorizationMethods) {
        const tenantName = topicParameter.tenant
        const namespaceName = topicParameter.namespace
        const topicName = topicParameter.topic
        const serviceUrl = topicParameter.url
        const headers = generateAuthHeader(authData, authMethod)

        const options: FetchOptions = {
            method: "GET",
            headers: headers,
            responseType: ResponseType.JSON
        }

        const url = `${serviceUrl}/admin/v2/persistent/${tenantName}/${namespaceName}/${topicName}/stats`
        return fetch(url, options);
}
}
