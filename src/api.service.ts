import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {retry} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class ApiService {

  constructor(private http: HttpClient) {
  }

  public get(href, disable_cache?: boolean): Observable<object> {
    const httpOptions = {};
    if (disable_cache) {
      httpOptions['params'] = new HttpParams().set('t', new Date().valueOf().toString());
    }

    return this.http.get(href, httpOptions).pipe(retry(1));
  }
}
