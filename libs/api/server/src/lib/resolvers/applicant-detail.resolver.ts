import { Injectable } from '@angular/core';
import { Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { CustomerCardApplicationGetListResponse } from '../models/applicant.model';
import { ApplicantService } from '../services/applicant.service';
import { NgxSpinnerService } from "ngx-spinner";

export interface ApplicantDetailResolved {
  data: CustomerCardApplicationGetListResponse | null,
  error?: string
}

@Injectable({
  providedIn: 'root'
})
export class ApplicantDetailResolver implements Resolve<ApplicantDetailResolved> {
  constructor(
    private applicantService: ApplicantService,
    private spinner: NgxSpinnerService
    ) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ApplicantDetailResolved> {
    const fanId = route.queryParamMap.get('fanid');

    if(!fanId) {
      return of(
        {
          data: null,
          error: 'Invalid Fan ID'
        }
      )
    }
    this.spinner.show()
    return this.applicantService.getApplicantDetailsByFanId(fanId)
    .pipe(map((response: any) => {
      const { data } = response ?? {};
      const err = data ? {} : { error: 'Applicant Detail Not Found' };
      return {
        data,
        ...err
       }
    }),
    catchError(err => {
      console.log('ApplicantDetailResolver', err)
      return of({
        data: null,
        error: err?.error?.message || 'Something went wrong!'
      })
    }),
    finalize(() => {
      this.spinner.hide()
    })
    )
  }
}
