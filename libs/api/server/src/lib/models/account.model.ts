import { ApiResultCode, HttpStatusCode } from "./api.model";

export class ChangePassword {
    userName?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword!: string;
    oldPassword!:string;
    password!:string;
    message?:string;
}

export class ProfileInitiate {
    userName!: string;
    firstName!: string;
    lastName!: string;
    email!: string;
    mobileNo!: number;
    organizationName!: string;
}
export class ProfileUpdate {
    userName!: string;
    firstName!: string;
    lastName!: string;
}

export interface GetProfileInfoForBulkRegisterModelDataResponse {
  message?: string | null;
  resultCode?: ApiResultCode;
  resulCodeType?: string | null;
  status?: HttpStatusCode;
  data?: GetProfileInfoForBulkRegisterModel;
}

export interface GetProfileInfoForBulkRegisterModel {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  phoneAreaCode?: string | null;
  phoneCountryCode?: string | null;
  organizationName?: string | null;
}

export interface GetProfileInfoForServiceCenterModel {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  phoneAreaCode?: string | null;
  phoneCountryCode?: string | null;
}

export interface GetProfileInfoForServiceCenterModelDataResponse {
  message?: string | null;
  resultCode?: ApiResultCode;
  resulCodeType?: string | null;
  status?: HttpStatusCode;
  data?: GetProfileInfoForServiceCenterModel;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export type TournamentType = 1 | 2;

export interface EmailOtpModel {
  email: string;
  languageCode?: string | null;
  firstName?: string | null;
  tournamentType?: TournamentType;
}

export interface SmsAndEmailOtpModel {
  recipientPhone: string;
  email: string;
  languageCode?: string | null;
  firstName?: string | null;
}

export interface SmsOtpModel {
  recipientPhone: string;
  languageCode?: string | null;
  tournamentType?: TournamentType;
}

export interface ValidateEmailOtpModel {
  email: string;
  emailOtpCode: string;
  tournamentType?: TournamentType;
}

export interface ValidateSmsOtpModel {
  recipientPhone: string;
  smsOtpCode: string;
  tournamentType?: TournamentType;
}

