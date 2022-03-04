import { Component, OnInit,AfterViewInit, OnDestroy,ElementRef, ViewChild} from '@angular/core';
import { Router} from '@angular/router';
import {AuthenticationService} from "../authentication.service";
import { ToastrService } from 'ngx-toastr';
import {Credentials} from "../credential";


import { HttpErrorResponse } from '@angular/common/http';

import { switchMap, tap, exhaustMap, finalize, catchError} from "rxjs/operators";
import {Observable,of, fromEvent, Subscription} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  credentials:any = {email:"", password:""};
  login$:Subscription;
  loginLoad:boolean;
  @ViewChild("loginBtn") loginBtn:ElementRef
  constructor(private auth:AuthenticationService, private router:Router, private toastr: ToastrService ) {
  }

  ngOnInit(): void {
    //here check if have the token or not if have then sktiip
    if(this.auth.isAuthenticated()){
      this.router.navigate(['/default']);
    }
    this.loginLoad = false;
  }
  ngAfterViewInit(){
    this.login$ =  fromEvent(this.loginBtn.nativeElement, "click").pipe(
      tap(()=>console.log("COLCI DETEDED")),
      finalize(()=>console.log("STOP LISTENING")),
      exhaustMap(()=>this.signIn(this.credentials))
    ).subscribe(()=>{},(err:HttpErrorResponse)=>{
      this.auth.signOut();
      this.toastr.error(err.error.message, "ERROR", {timeOut: 2000,
        positionClass: 'toast-top-center',closeButton:true});
    });
  }
  ngOnDestroy(){
    this.login$.unsubscribe();
  }
  signIn(credentials:Credentials):Observable<any>{
    return of(credentials).pipe(//catch error here so that it wont throw errors to login btn
      tap(()=>this.loginLoad = true),
      switchMap(()=>this.auth.signIn(credentials).pipe(
        catchError((err:HttpErrorResponse)=>{
          this.auth.signOut();
          this.loginLoad = false;
          this.toastr.error(err.error.message, "ERROR", {timeOut: 2000,
            positionClass: 'toast-top-center',closeButton:true});
          return of();
        }),
        tap((res:any)=>{
          localStorage.setItem("token", res.accessToken);
          localStorage.setItem("credentials", JSON.stringify(this.credentials));
          this.router.navigate(['/default']);
        })
      ))
    );
  }

}
