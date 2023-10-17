export interface Environment {
  production: boolean;
  application: string;
  apiUrl: string;
  mockUrl: string;
  instrumentationKey:string;
  sso:boolean;
  passKey:string;
  passValue:string;
  idleTime:number;
  logoutTime:number;
  ipKey:string
}

export interface EnvironmentPortal {
  production: boolean;
  application: string;
  apiUrl: string;
  mockUrl: string;
  portalUrl:string;
  instrumentationKey:string;

}
