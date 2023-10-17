import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedPortalCommonModule} from '@fan-id/shared/portal-common'
import { AmirCupLayoutComponent } from './amir-cup-layout/amir-cup-layout.component';
import { HomepageComponent } from './homepage/homepage.component';
import { WhatIsFanidComponent } from './what-is-fanid/what-is-fanid.component';
import { TermsandconditionComponent } from './termsandcondition/termsandcondition.component';
import { FaqComponent } from './faq/faq.component';
import { CookieService } from 'ngx-cookie-service';
import { AmirCupCookieConsentComponent } from './amir-cup-cookie-consent/amir-cup-cookie-consent.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { SiteDownComponent } from './site-down/site-down.component';
const routes: Routes = [
  {
    path: '',
    component: AmirCupLayoutComponent,
    children: [
      {
        path:'home',
        component:SiteDownComponent
      },
      // {
      //   path:'what-is-fan-id',
      //   component:WhatIsFanidComponent
      // },
      // {
      //   path:'faq',
      //   component:FaqComponent
      // },
      // {
      //   path:'terms-of-use',
      //   component:TermsandconditionComponent
      // },
      // {
      //   path:'cookie-policy',
      //   component:CookiePolicyComponent
      // },
      // {
      //   path:'privacy-policy',
      //   component:PrivacyPolicyComponent
      // },
      // {
      //   path:'reset-password',
      //   component:HomepageComponent
      // },
      // {
      //   path:'main',
      //   loadChildren:()=>
      //   import('@fan-id/feature/amir-cup-main').then((module)=>module.FeatureAmirCupMainModule)
      // },

      {
        path:'',
        redirectTo:'/home'
      }
     //add other routes here
    ],
  }

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    TranslateModule.forChild(),
    SharedPortalCommonModule
  ],
  providers: [CookieService],
  declarations: [
    AmirCupLayoutComponent,
    HomepageComponent,
    WhatIsFanidComponent,
    TermsandconditionComponent,
    FaqComponent,
    AmirCupCookieConsentComponent,
    CookiePolicyComponent,
    PrivacyPolicyComponent,
    SiteDownComponent,
  ],
})

export class FeatureAmirCupModule {}
