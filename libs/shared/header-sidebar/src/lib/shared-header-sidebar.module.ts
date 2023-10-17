import { TranslateModule } from '@ngx-translate/core';
import { FieldsetWrapperComponent } from './fieldset-wrapper/fieldset-wrapper.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { Routes, RouterModule } from '@angular/router';
import { CoreModule } from '@fan-id/core';
import { LanguageComponent } from './language/language.component';
import { LoaderComponent } from './loader/loader.component';
import { WarningComponent } from './warning/warning.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { StepperComponent } from './stepper/stepper.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CoreModule,
    TranslateModule.forChild(),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxMaskModule,
  ],
  declarations: [
    HeaderComponent,
    SidebarComponent,
    LanguageComponent,
    LoaderComponent,
    FieldsetWrapperComponent,
    WarningComponent,
    StepperComponent,
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    LanguageComponent,
    LoaderComponent,
    FieldsetWrapperComponent,
    WarningComponent,
    StepperComponent,
  ],
})
export class SharedHeaderSidebarModule {}
