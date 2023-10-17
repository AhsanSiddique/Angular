interface IPendingApplicationVerificationStatusRequestError {
  errorCode?: string | null;
  errorMessage?: string | null;
  errorMessageAR?: string | null;
  reasonText?: string | null;
  rejectedReasonType?: number;
}

export interface IPendingApplicationVerificationStatusRequest {
  FANID: string;
  DocumentIdNo: string;
  applicationStatus: string;
  force?: boolean | null;
  error?: IPendingApplicationVerificationStatusRequestError[] | null;
}