import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Secret } from '../shared/datamodel/k8s/secret';
import { Observable } from '../../../node_modules/rxjs/Observable';
import { AppConfig } from '../app.config';

@Injectable()
export class CoreServicesService {

  constructor(private http: HttpClient) { }

  public getSecret(name: string, namespace: string, token: string): Observable<Secret> {
    const httpOptions = this.getHTTPOptions(token);
    const url = `${AppConfig.k8sApiServerUrl}/namespaces/${namespace}/secrets/${name}`;
    return this.http.get<Secret>(url, httpOptions);
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
