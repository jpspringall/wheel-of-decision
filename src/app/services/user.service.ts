import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { UserList } from 'src/models/user.list.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private usersUrl = '/api/users'; // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  getUsers(partitionKeyValue: string): Observable<UserList> {
    return this.http
      .get<UserList>(`${this.usersUrl}/${partitionKeyValue}`)
      .pipe(
        catchError(
          this.handleError<UserList>('getUsers', {
            partitionKeyValue: '',
            users: [],
          })
        )
      );
  }

  setUsers(users: UserList): Observable<boolean> {
    return this.http.post<void>(this.usersUrl, users).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('setUsers', false))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
