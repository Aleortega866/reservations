declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | {
      storage?: 'localStorage' | 'sessionStorage' | 'cookies'
      key?: string
      serializer?: {
        serialize?: (value: any) => string
        deserialize?: (value: string) => any
      }
    }
  }
}
