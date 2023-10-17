import { Component, Input, OnInit } from '@angular/core';
import { FormGroupInput } from '../../base-classes';
import { Observable } from 'rxjs';
import { MetadataResolve } from '@fan-id/api/server';
import { Validators } from '@angular/forms';
import { setContactFormInitialValidators } from '@fan-id/shared/utils/form';
import { dialingCodeSearchFn } from '@fan-id/shared/utils/common';

@Component({
  selector: 'fan-id-contact-information-form',
  templateUrl: './contact-information-form.component.html',
  styleUrls: ['./contact-information-form.component.scss']
})
export class ContactInformationFormComponent extends FormGroupInput implements OnInit {
  @Input() isExcel? = false;
  @Input() metadata$: Observable<MetadataResolve>;
  dialingCodeSearchFn = dialingCodeSearchFn;

  ngOnInit() {
    setContactFormInitialValidators(this.formGroup);
  }

  get f() {
    return this.formGroup.controls;
  }


}
