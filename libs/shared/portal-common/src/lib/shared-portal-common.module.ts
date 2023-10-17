import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageComponent } from './language/language.component';
import { CoreModule } from '@fan-id/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterMainComponent } from './footer-main/footer-main.component';
import {RouterModule} from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiServerModule } from '@fan-id/api/server';
import { RecaptchaModule } from "ng-recaptcha";
import { RegisterHeaderComponent } from './register-header/register-header.component';
import { RegisterSidebarComponent } from './register-sidebar/register-sidebar.component';
import { RegisterFooterComponent } from './register-footer/register-footer.component';
import { PasswordCheckComponent } from './password-check/password-check.component';

@NgModule({
	imports: [
		CommonModule,
		TranslateModule,
		CoreModule,
		RouterModule,
		RecaptchaModule,
		FormsModule,
		ReactiveFormsModule,
		ApiServerModule
	],
	exports:[
    HeaderComponent,
    FooterComponent,
    FooterMainComponent,
    SidebarComponent,
    RegisterHeaderComponent,
    RegisterSidebarComponent,
    RegisterFooterComponent,
    PasswordCheckComponent
  ],
	declarations: [
		HeaderComponent,
		FooterComponent,
		LanguageComponent,
		SidebarComponent,
		FooterMainComponent,
		RegisterHeaderComponent,
		RegisterSidebarComponent,
		RegisterFooterComponent,
    PasswordCheckComponent
	],
})
export class SharedPortalCommonModule {}
