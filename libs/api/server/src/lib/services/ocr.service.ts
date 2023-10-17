import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  OCRandFMRequest,
  OCRandFMResponseDataResponse,
} from '../models/ocr.model';
import { Environment, FanIDConfig } from '@fan-id/core';

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private apiUrl: string;
  private path = '/api/OCRandFM';
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient
  ) {
    this.apiUrl = this.config.apiUrl;
  }

  getOCRandFM(body: OCRandFMRequest) {
    const endpoint = '/get-ocr-fm';
    const url = this.apiUrl + this.path + endpoint;
    const headers = new HttpHeaders().set(
      "content-type",
      "multipart/form-data"
    );

    const formData = new FormData();
    const bodyMap = new Map(Object.entries(body));
    bodyMap.forEach((value, key) => formData.append(key, value));
    return this.http.post<OCRandFMResponseDataResponse>(url, formData, { headers });
  }

}
