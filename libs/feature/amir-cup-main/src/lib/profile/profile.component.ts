import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DateFormatPipe } from '@fan-id/core';
import { AccountService, AuthService } from '@fan-id/api/server';
import { take } from 'rxjs/operators';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'fan-id-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [DateFormatPipe],
	animations: [
		trigger('openClose', [
			// ...
			state('open', style({
				height: '!',
				opacity: 1,

			})),
			state('closed', style({
				height: '0px',
				opacity: 0,
			})),
			transition('open => closed', [
				animate('0.1s')
			]),
			transition('closed => open', [
				animate('0.1s')
			]),
		]),
	],
})
export class ProfileComponent implements OnInit {
  profileDetails:any = {};
  expiry_date = '';
  dob = '';
  propic:any =''
	public isOpenfirst = true;
	public isOpensecond = false;
	public isOpenthird = false;
	public isOpenfour = false;
	public isOpenfive = false;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private dateFormatPipe: DateFormatPipe,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.accountService.customerPortalGetprofile()
    .pipe(take(1))
    .subscribe(response => {
      this.profileDetails = response?.data ?? {}
      this.expiry_date = this.dateFormatPipe.transform(this.profileDetails.expiryDate);
      this.dob = this.dateFormatPipe.transform(this.profileDetails.dateOfBirth)
      this.propic = this.authService.composeCustomerPortalImageUrl(this.profileDetails.profileImageUrl);
    },
    err => {
      console.log(err)
      // this.router.navigate(['main/dashboard'])
    })
  }
	onClickAccordion(id){
		switch(id){
			case 1:
				this.isOpenfirst = !this.isOpenfirst
				break;
			case 2:
				this.isOpensecond = !this.isOpensecond;
				break;
			case 3:
				this.isOpenthird = !this.isOpenthird;
				break;
			case 4:
				this.isOpenfour = !this.isOpenfour;
				break;
			case 5:
				this.isOpenfive = !this.isOpenfive;
				break;
		}

	}

}
