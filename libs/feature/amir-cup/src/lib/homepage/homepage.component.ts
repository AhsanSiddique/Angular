import { AfterContentInit, Component, OnInit } from '@angular/core';
import {style, state, animate, transition, trigger} from '@angular/animations';
import { ActivatedRoute, Router,NavigationStart } from '@angular/router';
import { MuliformService  } from '@fan-id/api/server';
import { LocationStrategy } from '@angular/common';
import { CoreService } from '@fan-id/core';


@Component({
  selector: 'fan-id-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  isLoggedIn:boolean=true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
	private mservice:MuliformService,
	  private location: LocationStrategy,
    private coreService: CoreService,
  ) {
	  history.pushState(null,"null", window.location.href);
    // check if back or forward button is pressed.
    this.location.onPopState(() => {
        history.pushState(null,"null", window.location.href);
    });
  }
  faq=[
    {
      key:'Homepage.WhatisFanID',
      value:'Homepage.whatisfanidvalue'
    },
    {
      key:'Homepage.StadiumAccess',
      value:'Homepage.stadiumaccessvalue'
    },
    {
      key:'Homepage.ValidityPeriod',
      value:'Homepage.validityperiodvalue'
    },
    {
      key:'Homepage.WhoFanID',
      value:'Homepage.whowillneedafanid'
    },
    {
      key:'Homepage.Benefit',
      value:'Homepage.benefitsvalue'
    }

  ]
  selectedFaq:string='';
  selectedValue:string='';
  ngOnInit(): void {
    const token=JSON.parse(this.coreService.decryptValue(localStorage.getItem('accessToken')));

    if(token)
    {
      this.isLoggedIn=true;
    }
    else{
      this.isLoggedIn=false;
    }
    this.setFaq(this.faq[0].key,this.faq[0].value);
    const fragment = this.route.snapshot.queryParamMap.get('fragment');
    if(fragment) {
      this.scrollToFragment(fragment)
    }
	this.mservice.clearMultiFormData();
  }

  scrollToFragment(fragment: string) {
    const el = document.getElementById(fragment);
    setTimeout(() => {
      const pos = el.style.position;
      const top = el.style.top;
      el.style.position = 'relative';
      el.style.top = '-200px';
      el.scrollIntoView({ block: 'start', behavior: 'smooth' });
      el.style.position = pos;
      el.style.top = top;
    }, 100);
  }

  setFaq(faqObject:string,contents:string){
    this.selectedFaq=faqObject;
    this.selectedValue=contents;
  }

  checkStatus(){
    this.router.navigate(['/main/dashboard']);
  }
}
