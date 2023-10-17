export class FanCategory {
  id: string;
  name: string;
}

export class Country {
  id: string;
  name: string;
}

export class Profession {
  id: string;
  name: string;
}

export class Phonecode {
  id: string;
  value: string;
}

export class Title {
  id: string;
  value: string;
}

export class Medical {
  id: string;
  name: string;
}

export class UserCategory {
  id: string;
  name: string;
}

export class UploadManualData {
  eventname: string;
  organizationname: string;
  bulkgroupname: string;
  numberofapplication: number;
  deliverytype: string;
  servicecentre: string;
}

export class ManualSubmissionStatus {
  submittedRecords: number;
  failedRecords: number;
}
export class ManualBulkImportData {
  id: number;
  uploadstatus: string;
  firstName: string;
  lastName: string;
  profilepic: string;
  idtype: string;
  document: string;
  expirydate: Date;
  expirystatus: string;
  email: string;
  countrycode: number;
  contactno: number;
  gender: string;
}
export class ManualImportHeaderInfo {
  eventname: string;
  organizationname: string;
  bulkgroupname: string;
  numberofapplication: number;
  deliverytype: string;
  servicecentre: string;
}


