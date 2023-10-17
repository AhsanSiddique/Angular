import { AccomadationDashboardComponent } from "./accomadation-dashboard/accomadation-dashboard.component";
import { AccommodationTableBase } from "./accommodation-table.base";
import { QaaComponent } from "./qaa/qaa.component";
import { SitaComponent } from "./sita/sita.component";

export enum EFilterState {
  NONE = 'none',
  NORMAL = 'normal',
  ADVANCED = 'advanced'
}

export type TTableComponent = 
QaaComponent | 
SitaComponent | 
AccomadationDashboardComponent | 
AccommodationTableBase;