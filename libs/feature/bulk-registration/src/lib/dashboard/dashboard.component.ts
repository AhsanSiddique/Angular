import { Component, OnInit } from '@angular/core';
import {
  DashboardService,
  DashboardEvents,
  DashboardStatistics,
} from '@fan-id/api/server';
import { MenuService } from '@fan-id/core';
@Component({
  selector: 'fan-id-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(private dashboardService: DashboardService, private menuService: MenuService) { }
  
  ngOnInit(): void {
  
  }
  
}
