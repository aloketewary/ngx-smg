import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * @description Swagger Petstore Base Http Service
 * @version 1.0.0
 */
@Injectable({
  providedIn: 'root'
})
export abstract class AbstractHttpService {
    protected baseUrl = 'https://petstore.swagger.io/v2';
    protected className: string;
    constructor(
      protected className: string,
      protected http: HttpClient
    ) {
      this.className = className;
    }
}