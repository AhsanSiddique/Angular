import { Environment } from '@fan-id/core';
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment: Environment = {
  production: false,
  application: 'ServiceCenter',
  apiUrl: 'https://stg-webapi-external.hcep.qa',
  mockUrl: '',
  instrumentationKey:'074a7a08-eb7d-4cb4-ac19-6c861e4fdf7b' ,
  sso:true,
  passKey:"896AC3CC8A9B56E3",
  passValue:"A3693E046EF930AB",
  idleTime:900,
  logoutTime:900,
  ipKey:"4PAuCqwSeedxXRS4HaMR949vV8dDB70pGoPlUVULKq9CUpkWjB"

};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';
// Included with Angular CLI.
