import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { CustomerCardIntegrationResponse } from '../models/applicant.model';
import { ApplicantService } from '../services/applicant.service';

interface CardIntegrationStatusResolved {
  data: CustomerCardIntegrationResponse | null;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CardIntegrationStatusResolver
  implements Resolve<CardIntegrationStatusResolved> {
  constructor(
    private applicantService: ApplicantService,
    private spinner: NgxSpinnerService
  ) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CardIntegrationStatusResolved> {
    const applicationID = route.queryParamMap.get('id');
    if (!applicationID) {
      return of({
        data: null,
        error: 'Invalid Application ID',
      });
    }
    this.spinner.show();
    return this.applicantService
      .getCardIntegrationStatusByApplicationId(applicationID)
      .pipe(
        map((response) => {
          const { data } = response ?? {};
          const err = data ? {} : { error: 'Card Status Not Found' };
          return {
            data,
            ...err,
          };
        }),
        catchError((err) => {
          console.log('CardIntegrationStatusResolver', err);
          return of({
            data: null,
            error: err?.error?.message || 'Something went wrong!',
          });
        }),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
}
