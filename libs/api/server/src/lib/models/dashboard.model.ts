export interface DashboardEvents {
  name: string;
  year: string;
  startDate: string;
  endDate: string;
  colorCode: string;
  image: string;
  code: string,
  endTime: string,
  startTime: string,
  tournamentType: number
  imageUrl:any;
}

export interface DashboardStatistics {
  total_Ready_for_Collection: any;
  today_Ready_for_Collection:any;
  totalNoOfApplications: number;
  totalApplication: number;
  totalcardsIssues: number;
  todaysCardPrinted?:number;
  todaysCardCollected?:number;
  total_Application_Printed?:number;
  total_Collected_by_Fan?:number;
  total_Home_Delivery?:number,
  today_Home_Delivery?:number
}

export interface IConfigurationTypeResponse {
  /** @format int64 */
  id?: number;
  keyName?: string | null;
  value?: string | null;

  /** @format int64 */
  refConfigType_Id?: number | null;
  name?: string | null;
  description?: string | null;
}