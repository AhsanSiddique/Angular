import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TournamentType } from '@fan-id/api/server';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditApplicationGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const eventType = parseInt(localStorage.getItem('eventType')) as TournamentType;
      if (eventType == 1) {
        this.router.navigate(['/main/all-applications/list/applicant-details/edit-domestic'],{queryParams:route.queryParams});
        return false;
      }
      return true;
  }
  
}
