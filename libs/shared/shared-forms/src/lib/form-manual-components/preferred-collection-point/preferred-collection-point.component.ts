import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MetadataResolve } from '@fan-id/api/server';
import { Observable, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';

@Component({
  selector: 'fan-id-preferred-collection-point',
  templateUrl: './preferred-collection-point.component.html',
  styleUrls: ['./preferred-collection-point.component.scss']
})
export class PreferredCollectionPointComponent extends FormGroupInput implements OnInit, OnDestroy {

  @Input() metadata$:Observable<MetadataResolve>;
  private readonly unsubscribe$ = new Subject<void>();

  address_line_labels = {
    1: "Address Line 1",
    2: "Address Line 2",
    3: "Address Line 3",
    4: "ZIP Code/PO Box",
  };

  ngOnInit() {
    this.df.deliver_country.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((country) => {
        if (country === "QA") {
          this.address_line_labels = {
            1: "Building Number",
            2: "Zone Number",
            3: "Unit Number",
            4: "Street Number",
          };

          this.df.address_line_1.setValidators([
            Validators.required,
            Validators.pattern("[0-9]*"),
          ]);
          this.df.address_line_2.setValidators([
            Validators.required,
            Validators.pattern("[0-9]*"),
          ]);
          this.df.address_line_3.setValidators([
            Validators.required,
            Validators.pattern("[0-9]*"),
          ]);
          this.df.address_line_4.setValidators([
            Validators.required,
            Validators.pattern("[0-9]*"),
          ]);
        } else {
          this.address_line_labels = {
            1: "Address Line 1",
            2: "Address Line 2",
            3: "Address Line 3",
            4: "ZIP Code/PO Box",
          };
          const validators = country ? [Validators.required] : [];
          this.df.address_line_1.setValidators(validators);
          this.df.address_line_2.setValidators(validators);
          this.df.address_line_3.setValidators(validators);
          this.df.address_line_4.setValidators([
            ...validators,
            Validators.pattern("[0-9]*"),
          ]);
        }

        this.df.address_line_1.updateValueAndValidity();
        this.df.address_line_2.updateValueAndValidity();
        this.df.address_line_3.updateValueAndValidity();
        this.df.address_line_4.updateValueAndValidity();
      });

    this.df.delivery_type.valueChanges
    .pipe(startWith(this.df.delivery_type.value),
     takeUntil(this.unsubscribe$))
     .subscribe((delivery_type) => {
        if(delivery_type === 'DTA') {
          this.df.deliver_country.setValue("QA");
        } else {
          this.df.deliver_country.setValue(null);
        }
     })

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get df() {
    return this.formGroup.controls;
  }

}
