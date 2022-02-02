import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import {Observable, of, from, iif, concat, defer} from "rxjs";
import {catchError, tap, filter, pluck, first, map, finalize, pairwise} from "rxjs/operators";



import {Credentials} from "./credential";
import {HubNodePair, HubNode} from "./hubNodePair";
@Injectable({
  providedIn: 'root'
})
export class HubNodeService {

  constructor(public http: HttpClient) { }


  convertHubNodeID(n:any[], hn:HubNode):HubNode{//here should only get shortName
    let o:any[] = JSON.parse((localStorage.getItem("nodeHubsApi")||"[]"));
    let newHubId:string = n.find((nx:any)=> nx.shortName === (o.find((ox:any)=>ox.id===hn.hubId)?.shortName))?.id ||"";
    let nodeShortName:string = (o.find((ox:any)=>ox.id===hn.hubId)?.nodes.find((oNodes:any)=>oNodes.id ===hn.nodeId)?.shortName)||"";
    let newNodeId:string = n.find((nx:any)=> nx.id === newHubId)?.nodes.find((nNode:any)=>nNode?.shortName === nodeShortName)?.id || ""
    return {hubId:newHubId, nodeId:newNodeId};
  }
  updateNodeHub(n:any){
    let nNodeHub:HubNodePair[] = [];
    let oNodeHub:HubNodePair[] = JSON.parse(localStorage.getItem("nodeHub")||"[]");
    for (let onh of oNodeHub){
      nNodeHub.push({email:onh.email, data:this.convertHubNodeID(n, onh.data)});
    }
    localStorage.setItem("nodeHub", JSON.stringify(nNodeHub));//the one with the users
    localStorage.setItem("nodeHubsApi", JSON.stringify(n));
  }

  get nodeHubConn$():Observable<any>{
    return this.http.get("/api/mtrac/nodeHub").pipe(
      first()
    );
  }

  addNodeHub(credentials:Credentials, pair:HubNodePair){
    if(!localStorage.getItem("nodeHub")){
      localStorage.setItem("nodeHub", JSON.stringify([pair]));
    } else {
      let l:any[] = JSON.parse(localStorage.getItem("nodeHub"));
      let u:any = l.find(i=>i.email === credentials.email);
      if (!u){
         l.push(pair);
         localStorage.setItem("nodeHub", JSON.stringify(l));
      }
    }
  }
  manualRefresh(curHN:HubNode):Observable<any>{
    let convertHN$:Observable<any> = this.nodeHubConn$.pipe(
      map((x:any[])=> {
        let rtnValue:HubNode = this.convertHubNodeID(x, curHN);
        this.updateNodeHub(x);
        return rtnValue;
      })
    );
    return concat(convertHN$,defer(()=>this.getNodeHub()) ).pipe(pairwise());
  }
  saveDefaultNodeHub(hn:HubNode){
    let l:HubNodePair[] = JSON.parse(localStorage.getItem("nodeHub")||"[]");
    localStorage.setItem("nodeHub",
      JSON.stringify(
        l.map(
          (i:HubNodePair)=>{
            if(i.email === JSON.parse(localStorage.getItem("credentials")).email){
              return {email:i.email, data:hn};
            }
            return i;
          }
        )
      )
    );
  }
  getDefaultNodeHub():HubNode{
    return (JSON.parse(localStorage.getItem("nodeHub"))as HubNodePair[])
    .find((i:HubNodePair)=>i.email === JSON.parse(localStorage.getItem("credentials")).email).data;

  }
  getNodeHub():Observable<any[]>{
    let saveData$:Observable<any[]> = this.nodeHubConn$.pipe(//get from api
      tap((x:any[])=>localStorage.setItem("nodeHubsApi", JSON.stringify(x)))
    );
    return iif(
        ()=>!!localStorage.getItem("nodeHubsApi"),
        of((JSON.parse(localStorage.getItem("nodeHubsApi"))) as any[]),
        saveData$
    );
  }
}
