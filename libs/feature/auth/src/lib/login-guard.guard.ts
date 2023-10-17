import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CoreService } from '@fan-id/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private router: Router,
    private coreService: CoreService,) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const token = JSON.parse(this.coreService.decryptValue(localStorage.getItem('accessToken')));
    if (token) {
      this.router.navigate(['/main/dashboard']);
      return false;
    }
    return true;
  }
  
}
