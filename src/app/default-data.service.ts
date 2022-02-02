import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router} from '@angular/router';

import {AuthenticationService} from "./authentication.service";
import {HubNodeService} from "./hub-node.service";

import {HubNodePair, HubNode} from "./hubNodePair";

import {Observable, of, from, iif, throwError} from "rxjs";
import {catchError, tap, filter, pluck, first, switchMap} from "rxjs/operators";
@Injectable({
  providedIn: 'root'
})

export class DefaultDataService {

  constructor(public http: HttpClient, private router:Router, private as:AuthenticationService, private hns:HubNodeService) { }
  //x is the formData
  saveDefault(x:any):Observable<any>{
    return of(x).pipe(
      tap((x:any)=>{
        //also must set the email
        let tmp:any[] = !JSON.parse(localStorage.getItem("defaultForm"))?[]:JSON.parse(localStorage.getItem("defaultForm"));
        if(tmp.map((t:any)=>t.email).includes(this.as.getCredentials().email)){
          //edit hte defualtForm
          tmp.forEach((i:any, index:number)=>{
            if(i.email ===this.as.getCredentials().email){
              tmp[index].formDetails = x;
            }
          });
        } else {
          //append to defautlForm
          tmp.push({email:this.as.getCredentials().email, formDetails:x});
        }
        localStorage.setItem("defaultForm",JSON.stringify(tmp));
        this.hns.saveDefaultNodeHub({hubId:x.hubId, nodeId:x.nodeId});
      })
    );
  }
  hubNodePair(){
    return JSON.parse(localStorage.getItem("nodeHub")).find(i=>i.email === this.as.getCredentials().email);
  }
  //get default
  getDefault():Observable<any>{
    let t:any[] = !JSON.parse(localStorage.getItem("defaultForm"))?[]:JSON.parse(localStorage.getItem("defaultForm"));
    if(t.filter((x:any)=>x.email===this.as.getCredentials().email).length < 1) return of(null);
    return from(t).pipe(
      filter((x:any)=>x.email === this.as.getCredentials().email),
      pluck("formDetails")
    );
  }

  sendRac(x:any):Observable<any>{
    return this.http.post("/api/mtrac/rac", x).pipe(
      first(),
      catchError((err:HttpErrorResponse)=>{
        if(err.error?.clientRetry || false){
          return this.hns.nodeHubConn$.pipe(
            switchMap((n:any[])=>{
              let tnh:HubNode =  this.hns.convertHubNodeID(n, {hubId:x.hubId, nodeId:x.nodeId});
              x.hubId = tnh.hubId;//here are the new ID
              x.nodeId = tnh.nodeId;//here are the new ID
              this.hns.updateNodeHub(n);//here update all the shit
              //here if nodeId is undefined throw error
              if(!x.nodeId){
                return throwError({error:{message:"nodeId is missing", data:{hubId:x.hubId, nodeId:x.nodeId}}});
              }
              return this.http.post("/api/mtrac/rac", x).pipe(first());
            })
          )
        }
        return throwError(err);
      })
    );
  }

}
