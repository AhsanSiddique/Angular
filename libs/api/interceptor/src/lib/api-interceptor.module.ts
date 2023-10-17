import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpInterceptorProviders } from '.';

@NgModule({
  imports: [CommonModule],
  providers: [httpInterceptorProviders],
})
export class ApiInterceptorModule {}
