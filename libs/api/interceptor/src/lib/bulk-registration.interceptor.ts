import { NgxSpinnerService } from "ngx-spinner";
import { Injectable } from "@angular/core";
import {
  Router,
} from '@angular/router';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { CoreService } from "@fan-id/core";
@Injectable()
export class BulkRegistrationInterceptor implements HttpInterceptor {
  constructor(private spinner: NgxSpinnerService,private router:Router,private coreService: CoreService,) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    this.spinner.show();
    const token = JSON.parse(this.coreService.decryptValue(localStorage.getItem('accessToken')));
    const contentType =
      request.headers.get("content-type") ?? "application/json";
    const accept = request.headers.get('accept');

    let headers = new HttpHeaders()
      .set("content-type", contentType)
      .set("Access-Control-Allow-Origin", "*");
      //below if-else implemented for customer portal login token

      if(request.url.includes("/api/Token/getAccessToken") || request.url.includes("/api/Token/sendLoginOtp"))
      {
        const idToken = JSON.parse(this.coreService.decryptValue(localStorage.getItem('idToken')));
        headers = headers.set("Authorization", `Bearer ${idToken}`)
      }
      else{
        headers = headers.set("Authorization", `Bearer ${token}`)
      }



    // for image request in applicant service
    if(accept) {
      headers = headers.set('accept', accept)
    }

    let cloneRequest = request.clone({
      headers,
    });

    if (contentType === "multipart/form-data") {
      cloneRequest = cloneRequest.clone({
        headers: cloneRequest.headers.delete("content-type"),
      });
    }

    return next.handle(cloneRequest).pipe(
      catchError((x) => this.handleAuthError(x)),
      finalize(() =>
        setTimeout(() => {
          this.spinner.hide();
        }, 300)
      )
    );
  }

  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    console.log("error.err", err);
    if (err.status === 401 ) {
      const errorObj = {
        isUnAuthorized: true,
      };
      localStorage.removeItem('accessToken');
      this.router.navigate(['auth/login']);
    }

    return throwError(err);
  }
}
