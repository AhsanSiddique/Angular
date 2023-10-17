export class AllApplicationListData {
  applicationdate: string;
  applicationnumber: string;
  applicationstatus: string;
  approvalcomments: string;
  fanidnumber: string;
  documenttype: string;
  documentnumber: string;
  nationality: string;
  firstname: string;
  lastname: string;
  mobilenumber: string;
  gender: string;
  dateofbirth: string;
  profession: string;
  salary: string;
  submissiontype: string;
  fanidcarddetails: string;
}

export class AllApplicationListFilter {
  columnName: string;
  filteTxt: string;
}

export class ListColumnName {
  id: number;
  name: string;
}

export class ApplicantData {
  application_type: string;
  application_date: string;
  approval_comments: string;
  application_number: string;
  application_status: string;
  document_quality_score: string;
  faceid_score: string;
  background_check_status: string;
  current_country: string;
  submission_type: string;
  fanid_category: string;
  fanid_number: string;
  fanid_card_details: string;
  fanid_card_btaddress: string;
  fanid_card_status: string;
  user_image_url: string;
  document_type: string;
  document_number: string;
  expiry_date: string;
  title: string;
  firstname: string;
  lastname: string;
  nationality: string;
  dateofbirth: string;
  country_code: string;
  mobile: string;
  gender: string;
  email: string;
  profession: string;
  salary: string;
  user_category: string;
  medical: string;
  address_country: string;
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  address_line_4: string;
  delivery_type: string;
  delivery_address_country: string;
  delivery_address_line_1: string;
  delivery_address_line_2: string;
  delivery_address_line_3: string;
  delivery_address_line_4: string;
  service_centre: string;
  emergency_contacts?: any;
}

export class FanIdCardStatusList{
  value:number;
  name:string;
}

export class ApplicationStatusList{
  value:number;
  name:string;
}

export class CancelApplication{
  fanIDNo:string;
  documentIdNo:string;
  reason?:string;
}
