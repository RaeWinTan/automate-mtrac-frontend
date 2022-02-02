import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import {driverChecklist, racRiskFields,mainStuff,defaultTemplate} from "../risk";
import {FormControl,
         FormGroup,
         FormBuilder,
         FormArray,
         Validators} from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


import {CounterSignComponent} from "../counter-sign/counter-sign.component";
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import { ToastrService } from 'ngx-toastr';

import {AuthenticationService} from "../authentication.service";
import {VehicleAviService} from "../vehicle-avi.service";
import { DefaultDataService } from "../default-data.service";
import {HubNodeService} from "../hub-node.service";

import {shareReplay, pluck, map, switchMap, tap,filter, first, finalize, startWith, exhaustMap, catchError} from "rxjs/operators";
import {concat, Observable,from,iif, noop, of, Subject,BehaviorSubject, ReplaySubject, Subscription, fromEvent, throwError } from "rxjs";



@Component({
  selector: 'app-default-page',
  templateUrl: './default-page.component.html',
  styleUrls: ['./default-page.component.css']
})

export class DefaultPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('autoAvi', {read:MatAutocompleteTrigger}) ac:MatAutocompleteTrigger
  racControl:FormGroup;
  mainStuff:any;
  driverChecklist:any;
  racRiskFields:any;
  defaultTemplate:any;
  defRac$:any;
  avi$:Subject<String>;

  hubNodesLoad:boolean;
  hubNodes$:ReplaySubject<any[]>;
  nodes$:Observable<any>;

  sendRacLoad:boolean;
  sendRac$:Subscription;
  manualRefreshHubNodeAPI$:Subscription;

  @ViewChild("sendBtn") sendBtn:ElementRef
  @ViewChild("refreshBtn") refreshBtn:ElementRef

  constructor(private toastr: ToastrService,private fb:FormBuilder,private as:AuthenticationService, private ds:DefaultDataService, private modalService: NgbModal, private va:VehicleAviService,  private hns:HubNodeService) {
    this.mainStuff = mainStuff;//part of the form
    this.driverChecklist = driverChecklist;//part of the form
    this.racRiskFields = racRiskFields;//part of the form
    this.defaultTemplate = defaultTemplate();
    this.avi$ = new Subject();

    this.hubNodesLoad = true;
    this.sendRacLoad = false;
  }

  initChecklist(f:any){
    const checkArray: FormArray = this.racControl.get('driverChecklist') as FormArray;
    f.driverChecklist.forEach((val:string)=>{
      checkArray.push(new FormControl(val));
    });
  }
  initRacControl(f:any){
    let v:any = {};
    for (let i of this.racRiskFields){//later we have select functionality for this one
      v[i.fieldName] = this.fb.control(f[i.fieldName], [(input:FormControl)=>{
        return Validators.required(input) === null ? null:{required:`${i.title} is a required field`};
      }]);
    }
    for (let i of this.mainStuff){
      v[i.fieldName] = this.fb.control(f[i.fieldName], [(input:FormControl)=>{
        return Validators.required(input) === null ? null:{required:`${i.title} is a required field`};
      }]);
    }
    if(!f["standingOrder"]) v["standingOrder"] = false;
    else v["standingOrder"] = f["standingOrder"];
    v["standingOrder"] = this.fb.control(v["standingOrder"], [(input:FormControl)=> input.value ? null : {needST:`Standing Order needs to be checked`}]);
    v["driverChecklist"] = this.fb.array([]);
    v["hubId"] = this.fb.control(this.hns.getDefaultNodeHub().hubId);
    v["nodeId"] = this.fb.control(this.hns.getDefaultNodeHub().nodeId, [(input:FormControl)=>{
      return Validators.required(input) === null ? null:{required:`Node is a required field`};
    }]);
    this.racControl = this.fb.group(v);
    this.handleNodeChanges();
    this.initChecklist(f);
    if(this.racControl.value.vehicleNo !== "") this.vnFocus();
  }
  handleNodeChanges(){
    let filterNodes$= (hns:any[], id:string):Observable<any[]> => from(hns).pipe(
      filter((hn:any)=>hn.id === id),
      pluck("nodes")
    );
    let condition$=(hns:any[], id:string):Observable<any[]|void> =>
      iif(
        ()=>!hns.find((x)=>x.id===id),
        of(noop()),
        filterNodes$(hns, id)
      );
    this.nodes$ = this.racControl.controls["hubId"].valueChanges.pipe(
      startWith(this.hns.getDefaultNodeHub().hubId),
      switchMap((id:string)=>this.hubNodes$.pipe(//here change to empty if the current nodeId Does not exist in that hubId's node list
        switchMap((hns:any[])=>condition$(hns, id))
      ))
    );

  }
  ngOnInit(): void {
    this.defRac$ = this.getRacData().pipe(
      map((r=>{
        if(!r) return this.defaultTemplate;
        else return r;
      }))
    );
    this.defRac$.subscribe((f:any)=>{
      this.initRacControl(f);
    });
    //hubNodes must be a subject now
    //
    this.hubNodes$ = new ReplaySubject<any[]>(1);
    this.getNodeHub.subscribe();

  }

  get getNodeHub():Observable<any> {
    return concat(of(true).pipe(tap(()=>this.hubNodesLoad = true)), this.hns.getNodeHub().pipe(tap((x:any)=>{this.hubNodes$.next(x);this.hubNodesLoad = false})));
  }
  sendRac(dontHave:boolean, def:any):Observable<any>{
    return of(true).pipe(
      map((x:boolean)=>{
        this.sendRacLoad = true;
        return x;
      }),
      switchMap(()=>this.ds.sendRac(def).pipe(
        tap((res:any)=>{
          this.sendRacLoad = false;
          if(dontHave) {
            this.ds.saveDefault(this.racControl.value).subscribe((x)=>this.toastr.success("We have set this form as your default Rac values and sent it Rac to https://mtrac.ado.sg already", "SUCCESSFULLY"));
          }
          else this.toastr.success("We have sent Rac to mtrac.ado.sg for you", "SUCCESSFULLY", {timeOut:5000});
          const modelRef = this.modalService.open(CounterSignComponent, {size:"sm"});
          modelRef.componentInstance.id = res.id;
        }),
        catchError((err:HttpErrorResponse|any)=>{
          return throwError(err);
        })
      ))
    );
  }
  ngAfterViewInit(){
   this.sendRac$ = fromEvent(this.sendBtn.nativeElement, "click").pipe(
      exhaustMap(()=>{
        let t:any[] = !JSON.parse(localStorage.getItem("defaultForm"))?[]:JSON.parse(localStorage.getItem("defaultForm"));
        let dontHave:boolean = t.filter((x:any)=>x.email===this.as.getCredentials().email).length < 1;
        let def = JSON.parse(JSON.stringify(this.racControl.value));
        return this.sendRac(dontHave, def);
      })
    ).subscribe((x)=>{console.log("sendRac",x)},
    (err:HttpErrorResponse|any)=>{
      if(Array.isArray(err.error.message)){
        this.sendRacLoad = false;
        for(let e of err.error.message) this.toastr.error(e, "WRONG INPUT", {positionClass: 'toast-top-center',timeOut:5000});
      }
      else {
        this.toastr.error(err.error.message, "ERROR OCCURED");
        this.sendRacLoad = false;
        if(err.error?.data){
          //here must referesh the optsion again
          this.getNodeHub.pipe(
            finalize(()=>{
              this.racControl.patchValue({
                hubId:err.error.data.hubId,
                nodeId:err.error.data.nodeId
              });
            })
          ).subscribe(()=>{}, ()=>{},()=>this.sendRacLoad=false);
        }
      }
    },
    ()=>console.log("all is done"));
    this.manualRefreshHubNodeAPI$ = fromEvent(this.refreshBtn.nativeElement, "click").pipe(
      exhaustMap(()=>this.manualRefresh()),
      tap(()=>console.log("AFTER EXHAUST MAP "))
    ).subscribe();
  }
   manualRefresh():Observable<any>{
    return concat(
      of(true).pipe(tap(()=>this.hubNodesLoad = true))
      ,this.hns.manualRefresh({hubId:this.racControl.value.hubId, nodeId:this.racControl.value.nodeId}).pipe(
        tap((data:any[])=>{
          this.hubNodes$.next(data[1]);
          this.racControl.patchValue({
            hubId:"",
            nodeId:""
          });
        }),
        finalize(()=>this.hubNodesLoad = false)
      )
    )
  }
  ngOnDestroy(){
    this.manualRefreshHubNodeAPI$.unsubscribe();
    this.sendRac$.unsubscribe();
  }

  onSOChange(e:any){
    this.racControl.patchValue({"standingOrder":e.target.checked});
  }
  onCheckboxChange(e:any) {
    const checkArray: FormArray = this.racControl.get('driverChecklist') as FormArray;
    if (e.target.checked) {
      checkArray.push(new FormControl(e.target.value));
    } else {
      checkArray.controls.forEach((item: FormControl, index:number) => {
        if (item.value == e.target.value) {
          checkArray.removeAt(index);
          return;
        }
      });
    }
  }

  getRacData():Observable<any>{
    return this.ds.getDefault().pipe(shareReplay(1));
  }

  vnFocus(){
    /*this.recommendAvi(this.racControl.value.vehicleNo).pipe(
      pluck("aviDate"),
      tap((x:any)=>{
          this.avi$.next(x);
      })
    ).subscribe();*/
  }

    recommendAvi(v:string):Observable<any>{
      return this.va.recommendAvi(v).pipe(shareReplay(1));
    }
}
