import { Component, Inject, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Environment, FanIDConfig, MenuService } from '@fan-id/core';
import { distinctUntilChanged, startWith } from 'rxjs/operators';

@Component({
  selector: 'fan-id-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  event: string = null;
  showWarning = false;
  path = '';
  warnText = '';
  isServiceCenter: boolean;
  isVoucherGenerationEnabled = false;
  bulkUrls=['/main/bulk-registration/upload/step-2'];
  isUserAgent: boolean;
  isAllMenuAllowed:boolean;
  menutoShow:any[];
  permissionList:any;
  accomodationPermission :any;
  verificationPermission:any;
  applicationPermission:any;
  otherAccommodationPermission:any
  brMenuList=[
    '/main/dashboard',
    '/main/bulk-registration',
    '/main/all-applications',
    '/main/voucher-codes',
    '/main/organization',
    '/main/knowledge-base'
  ]
  scMenuList=[
    '/main/dashboard',
    '/main/new-customer',
    '/main/all-applications',
    '/main/card-pickup',
    '/main/card-replacement',
    '/main/accommodation',
    '/main/verify-application',
    '/main/printer-management'
  ];
  cardPickUpPermission: any;
  configPermission: any;
  customVerify: any;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    public menuService: MenuService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.menuService.eventSubject
    .pipe(distinctUntilChanged())
    .subscribe((eventValue) => {
      this.path = '';
      this.event = eventValue;
      this.getMenuPermission()
      console.log('event', this.event);
    });
    
    this.router.events.pipe(startWith(this.router.url), distinctUntilChanged()).subscribe({
      next: (event: Event | string) => {
        if (typeof event === 'string') {
          this.setPathOnRouterChange(event);
        }
        if (event instanceof NavigationEnd) {
          this.setPathOnRouterChange(event.url);
        }
      }
    });

    this.isServiceCenter = this.config.application === 'ServiceCenter';
    this.isVoucherGenerationEnabled = localStorage.getItem('isVoucherGenerationEnabled') === 'true';
    this.isUserAgent = this.menuService.isUserTypeAgent;
    this.getMenuPermission();

  }

  getMenuPermission(){
   if(this.isServiceCenter) {
      this.permissionList = JSON.parse(localStorage.getItem('PermissionList'));
      if(this.permissionList?.fullAccess)
      this.isAllMenuAllowed = true
      else{
        this.accomodationPermission= this.permissionList?.roles?.find(
          (element) => element?.key === 'Accommodation'
        );
        this.verificationPermission = this.permissionList?.roles?.find(
          (element)=>element?.key === 'Customer Application Verify');
        this.configPermission = this.permissionList?.roles?.find(
          (element)=>element?.key === 'MACAddressToPrinterMap');
        this.cardPickUpPermission = this.permissionList?.roles?.find(
            (element)=>element?.key === 'ServiceCenter Applications');
        this.otherAccommodationPermission = this.permissionList?.roles?.find(
              (element)=>element?.key === 'Other Accommodation');
        this.customVerify = this.permissionList?.roles?.find(
                (element)=>element?.key === 'Application Management Approval');
        console.log(
          "acc",this.accomodationPermission,this.isServiceCenter,this.event)
      }
     }
     else{
      this.permissionList = JSON.parse(localStorage.getItem('PermissionList'));
      if(this.permissionList?.fullAccess)
      this.isAllMenuAllowed = true
      else{
        this.applicationPermission= this.permissionList?.roles?.find(
          (element) => element?.key === 'Customer Application'
        );

      }
    }
}

  redirectTo(event, path:string) {
    this.path="";
    const currentUrl=this.router.url;
    console.log("Navigate to other pages",currentUrl);
    if(path === '/main/accommodation'){
      localStorage.setItem('acc_activetab',"1")
    }
//
  //  if(this.bulkUrls.includes(currentUrl))
    const isDashboard = path === '/main/dashboard'
    if (this.event) {
      this.path = path;
      this.router.navigate([path]);
    } else {
      this.warnText = 'Dashboard.SelectEvent';
      this.showWarning = !isDashboard;
    }
  }

  close() {
    this.showWarning = false;
  }

  setPathOnRouterChange(url: string) {
    if (!url) return;
    const menuList = [
      '/main/printer-management/list',
      '/main/verify-application',
      '/main/verify-accommodation',
      '/main/approve-application',
      '/main/accommodation',
      '/main/card-replacement/list',
      '/main/card-pickup/list',
      '/main/knowledge-base',
      '/main/organization/all',
      '/main/voucher-codes/generate',
      '/main/bulk-groups/step-1',
      '/main/all-applications/list',
      '/main/bulk-registration',
      '/main/new-customer'
    ];
    const menu_url = menuList.filter((menu) => url.includes(menu));
    if (menu_url.length > 0 && this.path !== menu_url[0]) {
      this.path = menu_url[0];
    }
  }
}
