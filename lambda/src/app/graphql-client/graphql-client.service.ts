import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GraphqlClientService {

  constructor(private http: HttpClient) { }

  request(url, query, variables, token: string): Observable<any> {
    const httpOptions = this.getHTTPOptions(token);
    return this.http.post(url, { query, variables }, httpOptions);
  }

  getHTTPOptions(token: string): object {
    let httpHeaders: any;
    httpHeaders = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
    return httpHeaders;
  }
}
