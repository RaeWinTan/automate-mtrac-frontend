import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";

import {Credentials} from "./credential";
import {HubNodeService} from "./hub-node.service";


@Injectable({
  providedIn: 'root'
})
/*{
  providedIn: 'root'
}*/
export class AuthenticationService {

  constructor(public http: HttpClient, private hns:HubNodeService) {

  }
  signOut():void{
    localStorage.removeItem("token");
    localStorage.removeItem("credentials");
  }

  signIn(credentials:any):Observable<any>{
    return this.http.post('/api/mtrac/login', credentials).pipe(
      tap((x:any)=>this.hns.addNodeHub(credentials, {email:credentials.email,data:{hubId:x.node.hub.id,nodeId:x.node.id}}))
    );
  }
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !(token===null || token ===undefined || token ==="");
  }
  getToken():string {
   return localStorage.getItem('token')
  }
  getCredentials():Credentials{
    return JSON.parse(localStorage.getItem("credentials"));
  }
}
