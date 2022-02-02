import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Router} from '@angular/router';
import { Observable, throwError} from 'rxjs';
import {tap, catchError} from "rxjs/operators"
import {AuthenticationService} from "./authentication.service";
@Injectable({
  providedIn: 'root'
})


export class InterceptorService implements HttpInterceptor {

  constructor(public auth: AuthenticationService, private router:Router) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {//outgoin request
    //do this only when its needed
    if(this.auth.isAuthenticated()){
      request = request.clone({
        setHeaders: {
          authorization: this.auth.getToken(),
          credentials:JSON.stringify(this.auth.getCredentials())
        }
      });
    }
    /*
    handle the response here
    over here
    */
    return next.handle(request).pipe(
      tap((event) =>{
        if( event instanceof HttpResponse){
          if(event.headers.has("authorization")){
              localStorage.setItem("token",event.headers.get("authorization"));
          }
        }
      }),catchError((error:any)=>{
        if(error instanceof HttpErrorResponse){

          if(error.status === 400){
            this.auth.signOut();
            this.router.navigate(['/login']);
            return throwError(error);
          }
        }
        return throwError(error);
      })
    );
  }

}
