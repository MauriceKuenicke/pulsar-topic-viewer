export enum AuthorizationMethods {
    basicAuth = "Basic Auth",
    noAuth = "No Authentication"
}

export interface IBasicAuthCredentials{
    username: string
    password: string
}

export interface IAuthorizationData {
    [AuthorizationMethods.basicAuth]?: IBasicAuthCredentials;
    [AuthorizationMethods.noAuth]?: null;
}

export interface IStoredConfig {
    name: string
    tenant: string
    url: string
    namespace: string
    topic: string
    auth_method: AuthorizationMethods
    auth_creds: IAuthorizationData[AuthorizationMethods]
}
