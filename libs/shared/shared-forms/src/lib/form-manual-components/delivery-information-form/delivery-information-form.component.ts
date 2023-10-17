import { Component, OnDestroy, OnInit } from "@angular/core";
import { Validators } from "@angular/forms";
import {
  MetadataService,
  MetadataParams,
  NationalityLookup,
} from "@fan-id/api/server";
import { nationalitySearchFn } from "@fan-id/shared/utils/common";
import { Observable, of, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FormGroupInput } from "../../base-classes";

@Component({
  selector: "fan-id-delivery-information-form",
  templateUrl: "./delivery-information-form.component.html",
  styleUrls: ["./delivery-information-form.component.scss"],
})
export class DeliveryInformationFormComponent extends FormGroupInput
  implements OnInit, OnDestroy {
  constructor(private metadataService: MetadataService) {
    super();
  }

  private readonly unsubscribe$ = new Subject<void>();

  delivery_types: Observable<NationalityLookup[]>;
  service_centres = of([
    {
      name: "Khalifa International Stadium",
    },
  ]);

  address_line_labels = {
    1: "Address Line 1",
    2: "Address Line 2",
    3: "Address Line 3",
    4: "ZIP Code/PO Box",
  };

  countries: Observable<NationalityLookup[]>;
  metaDataLookupParam: MetadataParams = {};

  get df() {
    return this.formGroup.controls;
  }

  get nationalitySearchFn() {
    return nationalitySearchFn
  }

  ngOnInit() {
    this.countries = this.metadataService.getNationalities(
      this.metaDataLookupParam
    );
    this.delivery_types = this.metadataService.getDeliveryTypes(
      this.metaDataLookupParam
    );

    this.df.deliver_country.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((country) => {
        if (country === "Qatar") {
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
          this.df.address_line_1.setValidators([Validators.required]);
          this.df.address_line_2.setValidators([Validators.required]);
          this.df.address_line_3.setValidators([Validators.required]);
          this.df.address_line_4.setValidators([
            Validators.required,
            Validators.pattern("[0-9]*"),
          ]);
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
