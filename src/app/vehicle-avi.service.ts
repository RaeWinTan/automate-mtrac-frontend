import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {Observable, throwError, of} from "rxjs";
import {catchError} from "rxjs/operators";
import { Router} from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class VehicleAviService {
  private errorHandle=()=>catchError((error:any)=>{
    if(error instanceof HttpErrorResponse){
      if(error.status === 401){
        this.router.navigate(['/login']);
        return of({});
      }
    }
  });
  constructor(public http:HttpClient,private router:Router) { }

  recommendAvi(vehicleNo:String):Observable<any>{
    return this.http.post("/api/recommendAvi", {vehicleNo:vehicleNo}).pipe(
      this.errorHandle()
    );
  }

}
