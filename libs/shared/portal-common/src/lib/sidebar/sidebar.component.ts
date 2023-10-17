import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'fan-id-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  currentUrl:string='';
  constructor(private router:Router) {
    router.events.subscribe(events=>{
        this.currentUrl=this.router.url
    } );}

  ngOnInit(): void {
  }

}
