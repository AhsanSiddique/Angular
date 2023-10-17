import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FanIDConfig } from '@fan-id/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ApiInterceptorModule } from '@fan-id/api/interceptor';
import { environment } from '../environments/environment';
import { LanguageService } from '@fan-id/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export function HttpLoaderFactory(httpClient: HttpClient): any {
  return new TranslateHttpLoader(httpClient, '/assets/i18n/', '.json');
}
// Import library module

const routes: Routes = [
  // {
  //   path:'registration',
  //   loadChildren:()=>
  //   import('@fan-id/feature/amir-cup-registration').then((module)=>module.FeatureAmirCupRegistrationModule)
  // },
  //remove the registration routing

  {
    path: '',
    loadChildren: () =>
      import('@fan-id/feature/amir-cup').then((module) => module.FeatureAmirCupModule),
  }
];

const routeOptions: ExtraOptions = {
  // initialNavigation: 'enabled',
    onSameUrlNavigation: 'reload',
   scrollPositionRestoration: 'enabled',
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
  ],
  providers: [LanguageService, { provide: FanIDConfig, useValue: environment }],
  bootstrap: [AppComponent],
})
export class AppModule {}
