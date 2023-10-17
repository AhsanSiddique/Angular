import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationLayoutComponent } from './registration-layout/registration-layout.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedPortalCommonModule} from '@fan-id/shared/portal-common';
import { MultiFormStepFiveComponent } from './multi-form-step-five/multi-form-step-five.component';
import { MultiFormStepFourComponent } from './multi-form-step-four/multi-form-step-four.component';
import { MultiFormStepThreeComponent } from './multi-form-step-three/multi-form-step-three.component';
import { MultiFormStepOneComponent } from './multi-form-step-one/multi-form-step-one.component';
import { MultiFormStepTwoComponent } from './multi-form-step-two/multi-form-step-two.component'
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CountdownModule } from 'ngx-countdown';
import { RecaptchaModule } from "ng-recaptcha";
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CoreModule, CustomDateParserFormatter } from '@fan-id/core';
const routes: Routes = [
  {
    path: '',
    component: RegistrationLayoutComponent,
    children: [

      {
        path: 'two',
        component: MultiFormStepTwoComponent,
      },
      {
        path: 'three',
        component: MultiFormStepThreeComponent
      },
      {
        path: 'four',
        component:MultiFormStepFourComponent
      },
      {
        path: 'five',
        component:MultiFormStepFiveComponent
      },
      {
        path: '',
        component: MultiFormStepOneComponent,
      }
     //add other routes here
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedPortalCommonModule,
    TranslateModule.forChild(),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CountdownModule ,
    NgSelectModule,
    RecaptchaModule,
    CoreModule,
    NgxMaskModule.forRoot(),
    ImageCropperModule
  ],
  declarations: [
    RegistrationLayoutComponent,
    MultiFormStepFiveComponent,
    MultiFormStepFourComponent,
    MultiFormStepThreeComponent,
    MultiFormStepOneComponent,
    MultiFormStepTwoComponent
  ],
  providers: [
	{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class FeatureAmirCupRegistrationModule {}
