import { BaseResponse } from "./api.model";

export interface MetaDataLookup {
  /** @format int64 */
  id?: number;
  code?: string | null;
  name?: string | null;
  isEnabled?: boolean;
  sortorder?: number;
}

export type MetaDataLookupKeys = keyof MetaDataResponse;

export interface MetaDataResponse {
  applicationType?: MetaDataLookup[] | null;
  customerCategory?: MetaDataLookup[] | null;
  deliveryType?: MetaDataLookup[] | null;
  documentType?: MetaDataLookup[] | null;
  gender?: MetaDataLookup[] | null;
  medicalInformation?: MetaDataLookup[] | null;
  nationality?: NationalityLookup[] | null;
  profession?: MetaDataLookup[] | null;
  regUserCategory?: MetaDataLookup[] | null;
  title?: MetaDataLookup[] | null;
  channel?: MetaDataLookup[] | null;
  serviceCenter?: MetaDataLookup[] | null;
  tournament?: MetaDataLookup[] | null;
  event?: MetaDataLookup[] | null;
  reasonType?: MetaDataLookup[] | null;
  passportType?: MetaDataLookup[] | null;
  purposeOfVisit?: MetaDataLookup[] | null;
}

export interface MetaDataResponseDataResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  data?: MetaDataResponse;
}

export interface NationalityLookup {
  /** @format int64 */
  id?: number;
  code?: string | null;
  name?: string | null;
  isEnabled?: boolean;

  /** @format int64 */
  sortorder?: number | null;

  /** @format int64 */
  refApplicationType_Id?: number | null;
  dialingCode?: string | null;
  natCode?: string | null;
  isO3Code?: string | null;
}

// dialingCode models

export interface NationalityDropDownResponse {
  /** @format int64 */
  id?: number;
  code?: string | null;
  name?: string | null;
  dialingCode?: string | null;
}

export interface NationalityDropDownResponsePagingResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;

  /** @format int64 */
  totalCount?: number;
  dataList?: NationalityDropDownResponse[] | null;
}

export interface EnumTranslationItemListResponse extends BaseResponse {
  dataList: EnumTranslationItem[];
}

interface EnumTranslationItem {
  value: number;
  translation: string;
  name: string;
}
