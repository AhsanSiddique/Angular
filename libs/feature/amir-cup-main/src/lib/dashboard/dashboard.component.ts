import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, DashboardService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  cardStatusData:any ={}
  constructor(
    private dashboardService:DashboardService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.dashboardService.CustomerPortalGetCardStatus(localStorage.getItem('fanId'))
    .subscribe(response => {
      this.cardStatusData = response?.data ?? {}
      const { userProfilePic } = this.cardStatusData;
      this.cardStatusData.userProfilePic = this.authService.composeCustomerPortalImageUrl(userProfilePic);
    },err=>{
      // this.router.navigate(['home'])
      console.log(err)
    })
  }

}
