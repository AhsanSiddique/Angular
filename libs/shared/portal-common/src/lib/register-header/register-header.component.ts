import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'fan-id-register-header',
  templateUrl: './register-header.component.html',
  styleUrls: ['./register-header.component.scss']
})
export class RegisterHeaderComponent {

  constructor(private router: Router) { }

  redirectToHome() {
    this.router.navigateByUrl('/home');
  }

}
