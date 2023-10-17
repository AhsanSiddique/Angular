import { IRequlaFaceQualityDetail } from "@fan-id/shared/utils/ocr";

export interface OcrBody {
  var1: string;
}

export interface QIDFrontOcrResponse {
  DateOfBirth: string;
  DateOfExpiry: string;
  DocumentCode: string;
  Face: string;
  IssuingState: string;
  Message: string;
  Name: string;
  Nationality: string;
  QID: string;
  Status: string;
}

export interface PassportFrontOcrResponse {
  DateOfBirth: string;
  DateOfExpiry: string;
  DocumentCode: string;
  DocumentNo: string;
  Face: string;
  IssuingStateCode: string;
  Message: string;
  GivenNames: string;
  MRZ: string;
  NationalityCode: string;
  PersonalNo: string;
  Sex: string;
  Status: string;
  Surname: string;
}

export interface OCRandFMRequest {
  DocumentType: number;
  ProfileImage: File;
  DocImageFront: File
}

export interface OCRandFMResponse {
  result?: number;
  message?: string | null;
  status?: string | null;

  /** @format double */
  matchScore?: number | null;
  bioMatchId: string;
  passportResult?: OcrScanPassportResultDto;
  qidResult?: OcrScanQidResultDto;
}

export interface OCRandFMResponseDataResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  data?: OCRandFMResponse;
}

export interface OcrScanPassportResultDto {
  classificationCountry?: string | null;
  classificationScore?: string | null;
  dateOfBirth?: string | null;
  dateOfExpiry?: string | null;
  documentCode?: string | null;
  documentNo?: string | null;
  givenNames?: string | null;
  issuingStateCode?: string | null;
  mrz?: string | null;
  nationalityCode?: string | null;
  personalNo?: string | null;
  sex?: string | null;
  surname?: string | null;
}

export interface OcrScanQidResultDto {
  classificationScore?: string | null;
  dateOfBirth?: string | null;
  dateOfExpiry?: string | null;
  documentCode?: string | null;
  issuingState?: string | null;
  name?: string | null;
  nationality?: string | null;
  qid?: string | null;
}

export interface IRegulaPassportOCR {
  faceMatchScore: string,
  firstName: string | null,
  secondName: string | null,
  thirdName: string | null,
  fourthName: string | null,
  fifthName: string | null,
  dateofBirth: string | null,
  nationality: string | null,
  expiryDate: string | null,
  issuingCountry: string | null,
  gender: string | null,
  docNumber: string | null,
  docSubType: string | null
}

export interface IRegulaDetectFaceData {
  code?: number;
  msg?: string;
  results?: {
    detections?: {
      crop?: string,
      quality?: {
        details?: IRequlaFaceQualityDetail[]
      }
    }[] 
  }
}

export interface IRegulaDetectFaceResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  userErrorCode?: string | null;
  data?: IRegulaDetectFaceData;
}