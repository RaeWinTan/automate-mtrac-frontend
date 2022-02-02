import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import {driverChecklist, racRiskFields,mainStuff ,defaultTemplate} from "../risk";
import {FormControl,
         FormGroup,
         FormBuilder,
         FormArray,
         Validators} from '@angular/forms';

import { DefaultDataService } from "../default-data.service";
import {HubNodeService} from "../hub-node.service";

import { ToastrService } from 'ngx-toastr';

import {shareReplay, pluck, map, switchMap, tap,filter,take,first, exhaustMap, finalize} from "rxjs/operators";
import {Observable,from,iif,of,ReplaySubject,concat, fromEvent, Subscription} from "rxjs";
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, AfterViewInit, OnDestroy{
  racControl:FormGroup;
  mainStuff:any;
  driverChecklist:any;
  racRiskFields:any;
  defaultTemplate:any;
  defRac$:any;

  hubNodes$:ReplaySubject<any[]>;
  nodes$:Observable<any>;
  hubNodesLoad:boolean;

  saveRac$:Subscription;
  manualRefreshHubNodeAPI$:Subscription;

  @ViewChild("saveBtn") saveBtn:ElementRef
  @ViewChild("refreshBtn") refreshBtn:ElementRef

  constructor(private toastr: ToastrService,private fb:FormBuilder, private ds:DefaultDataService,  private hns:HubNodeService) {
    this.mainStuff = mainStuff;
    this.driverChecklist = driverChecklist;
    this.racRiskFields = racRiskFields;
    this.defaultTemplate = defaultTemplate();

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
      v[i.fieldName] = this.fb.control(f[i.fieldName]);
    }
    for (let i of this.mainStuff){
      v[i.fieldName] = this.fb.control(f[i.fieldName]);
    }
    if(!f["standingOrder"]) v["standingOrder"] = false;
    else v["standingOrder"] = f["standingOrder"];
    v["standingOrder"] = this.fb.control(v["standingOrder"]);
    v["driverChecklist"] = this.fb.array([]);
    v["hubId"] = this.fb.control(this.hns.getDefaultNodeHub().hubId);
    v["nodeId"] = this.fb.control(this.hns.getDefaultNodeHub().nodeId);
    //initialize the hubId and noed id here
    this.racControl = this.fb.group(v);
    this.handleNodeChanges();
    this.initChecklist(f);
  }
  handleNodeChanges(){
    let filterNodes$= (hns:any[], id:string):Observable<any[]> => from(hns).pipe(
      filter((hn:any)=>hn.id === id),
      pluck("nodes")
    );
    let condition$=(hns:any[], id:string):Observable<any[]|void> =>
      iif(
        ()=>!hns.find((x)=>x.id===id),
        of([]),
        filterNodes$(hns, id)
      );
    let start$ = this.hubNodes$.pipe(
        first(),
        switchMap((hns:any[])=>condition$(hns, this.hns.getDefaultNodeHub().hubId))
      );
    let subNodes$ = this.racControl.controls["hubId"].valueChanges.pipe(
      switchMap((id:string)=>this.hubNodes$.pipe(
        switchMap((hns:any[])=>condition$(hns, id).pipe(
          tap(()=>this.racControl.patchValue({nodeId:""}))
        ))
      ))
    );
    this.nodes$ = concat(start$, subNodes$);
  }

  ngOnInit(): void {
    this.hubNodesLoad = false;
    this.defRac$ = this.getRacData().pipe(
      map((r=>{
        if(!r) return this.defaultTemplate;
        else return r;
      }))
    );
    this.hubNodes$ = new ReplaySubject<any[]>(1);
    this.defRac$.subscribe((f:any)=>this.initRacControl(f));
    this.hns.getNodeHub().subscribe((x:any[])=>this.hubNodes$.next(x));
  }
  ngAfterViewInit():void{
    this.saveRac$ = fromEvent(this.saveBtn.nativeElement, "click").pipe(
      exhaustMap(()=>this.ds.saveDefault(this.racControl.value))
    ).subscribe(()=>this.toastr.success("We have saved your default RAC values", "SUCCESSFUL"));

    this.manualRefreshHubNodeAPI$ = fromEvent(this.refreshBtn.nativeElement, "click").pipe(
      exhaustMap(()=>
      of(true).pipe(
        tap(()=>{
          this.hubNodesLoad = true;
        }),
        switchMap(()=>this.hns.manualRefresh({hubId:this.racControl.value.hubId, nodeId:this.racControl.value.nodeId}).pipe(
          //must handle timeout errors on front end as well 

        )),
        finalize(()=>this.hubNodesLoad = false)
      ))
    ).subscribe((data:any[])=>{
      this.hubNodes$.next(data[1]);
      this.racControl.patchValue({
        hubId:"",
        nodeId:""
      });
    });
  }

  ngOnDestroy(){
    this.saveRac$.unsubscribe();
    this.manualRefreshHubNodeAPI$.unsubscribe();
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
  onSOChange(e:any){
    this.racControl.patchValue({"standingOrder":e.target.checked});
  }
  getRacData(){
    return this.ds.getDefault().pipe(shareReplay(1));
  }


}
