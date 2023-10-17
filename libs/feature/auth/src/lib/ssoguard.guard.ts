import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SsoguardGuard implements CanActivate {
  constructor(@Inject(FanIDConfig) private config: Environment) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      console.log("asdjhbgjasd")
      if(this.config.sso){
          return true;
      }
      else{
        return false;
      }
    }

}
