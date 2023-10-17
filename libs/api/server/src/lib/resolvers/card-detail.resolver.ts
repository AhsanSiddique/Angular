import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { CardGetByApplicationId } from '../models/applicant.model';
import { ApplicantService } from '../services/applicant.service';
import { NgxSpinnerService } from 'ngx-spinner';

interface CardDetailResolved {
  data: CardGetByApplicationId | null;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CardDetailResolver implements Resolve<CardDetailResolved> {
  constructor(
    private applicantService: ApplicantService,
    private spinner: NgxSpinnerService
  ) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CardDetailResolved> {
    const applicationID = route.queryParamMap.get('id');
    if (!applicationID) {
      return of({
        data: null,
        error: 'Invalid Application ID',
      });
    }
    this.spinner.show();
    return this.applicantService.getActiveCustomerCard(applicationID).pipe(
      map((response) => {
        const { data } = response ?? {};
        const err = data ? {} : { error: 'Card Detail Not Found' };
        return {
          data,
          ...err,
        };
      }),
      catchError((err) => {
        console.log('CardDetailResolver', err);
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
