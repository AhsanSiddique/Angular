import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import {
  MetadataParams,
  MetadataService,
  NationalityLookup,
} from '@fan-id/api/server';
import { Observable, of, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';
import { nationalitySearchFn } from '@fan-id/shared/utils/common'
@Component({
  selector: 'fan-id-address-information-form',
  templateUrl: './address-information-form.component.html',
  styleUrls: ['./address-information-form.component.scss'],
})
export class AddressInformationFormComponent
  extends FormGroupInput
  implements OnInit, OnDestroy {
  constructor(private metadataService: MetadataService) {
    super();
  }

  @Input() form_type?: string;

  private readonly unsubscribe$ = new Subject<void>();

  delivery_types: Observable<NationalityLookup[]>;

  service_centres = of([
    {
      name: 'Khalifa International Stadium',
    },
  ]);

  address_line_labels = {
    1: 'Address Line 1',
    2: 'Address Line 2',
    3: 'Address Line 3',
    4: 'ZIP Code/PO Box',
  };

  countries: Observable<NationalityLookup[]>;
  metaDataLookupParam: MetadataParams = {};

  get af() {
    return this.formGroup.controls;
  }

  get nationalitySearchFn() {
    return nationalitySearchFn;
  }

  ngOnInit(): void {
    this.countries = this.metadataService.getNationalities(
      this.metaDataLookupParam
    );
    this.delivery_types = this.metadataService.getDeliveryTypes(
      this.metaDataLookupParam
    );

    this.af.address_country.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((country) => {
        if (country === 'Qatar') {
          this.address_line_labels = {
            1: 'Building Number',
            2: 'Zone Number',
            3: 'Unit Number',
            4: 'Street Number',
          };

          this.af.address_line_1.setValidators([
            Validators.required,
            Validators.pattern('[0-9]*'),
            Validators.min(1),
          ]);
          this.af.address_line_2.setValidators([
            Validators.required,
            Validators.pattern('[0-9]*'),
            Validators.min(1),
          ]);
          this.af.address_line_3.setValidators([
            Validators.required,
            Validators.pattern('[0-9]*'),
            Validators.min(1),
          ]);
          this.af.address_line_4.setValidators([
            Validators.required,
            Validators.pattern('[0-9]*'),
            Validators.min(1),
          ]);

          if (this.form_type === 'new-customer') {
            this.delivery_types = this.metadataService.getDeliveryTypes(
              this.metaDataLookupParam
            );
          }
        } else {
          this.address_line_labels = {
            1: 'Address Line 1',
            2: 'Address Line 2',
            3: 'Address Line 3',
            4: 'ZIP Code/PO Box',
          };
          this.af.address_line_1.setValidators([Validators.required]);
          this.af.address_line_2.setValidators([Validators.required]);
          this.af.address_line_3.setValidators([Validators.required]);
          this.af.address_line_4.setValidators([
            Validators.required,
            Validators.pattern('[0-9]*'),
            Validators.min(1),
          ]);

          if (this.form_type === 'new-customer') {
            this.delivery_types = this.metadataService
              .getDeliveryTypes(this.metaDataLookupParam)
              .pipe(
                map((delivery_types) => {
                  return delivery_types.filter(
                    (delivery_type) => delivery_type.code === 'SCP'
                  );
                }),
                tap((delivery_types) => {
                  this.af.delivery_type.patchValue(delivery_types[0].code);
                })
              );
          }
        }

        this.af.address_line_1.updateValueAndValidity();
        this.af.address_line_2.updateValueAndValidity();
        this.af.address_line_3.updateValueAndValidity();
        this.af.address_line_4.updateValueAndValidity();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
