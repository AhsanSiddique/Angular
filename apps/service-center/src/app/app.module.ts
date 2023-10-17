import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { FanIDConfig } from '@fan-id/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '../environments/environment';
import { ApiInterceptorModule } from '@fan-id/api/interceptor';
import { LanguageService } from '@fan-id/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { ApplicationinsightsAngularpluginErrorService } from '@microsoft/applicationinsights-angularplugin-js';
import {NgIdleKeepaliveModule} from '@ng-idle/keepalive';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';

export function HttpLoaderFactory(httpClient: HttpClient): any {
  return new TranslateHttpLoader(httpClient, '/assets/i18n/', '.json');
}

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('@fan-id/feature/auth').then((module) => module.FeatureAuthBrModule),
  },
  {
    path: 'main',
    loadChildren: () =>
      import('@fan-id/feature/service-center').then(
        (module) => module.FeatureServiceCenterModule
      ),
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];

const routeOptions: ExtraOptions = {
  // initialNavigation: 'enabled',
  onSameUrlNavigation: 'reload',
  // scrollPositionRestoration: 'enabled',
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule,
    RouterModule.forRoot(routes, routeOptions),
    ApiInterceptorModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgxSpinnerModule,
    BrowserAnimationsModule,
    NgIdleKeepaliveModule.forRoot(),
    SharedSharedComponentsModule

  ],
  providers: [
    LanguageService,
    CookieService,
    { provide: FanIDConfig, useValue: environment },
    {
      provide: ErrorHandler,
      useClass: ApplicationinsightsAngularpluginErrorService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
