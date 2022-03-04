import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-counter-sign',
  templateUrl: './counter-sign.component.html',
  styleUrls: ['./counter-sign.component.css']
})
export class CounterSignComponent implements OnInit {
  @Input() id:string
  constructor(public activeModal: NgbActiveModal, private cs:ClipboardService) { }

  ngOnInit(): void {
  }
  copyLink(){
    this.cs.copy(`https://mtrac.ternary.digital/counter-sign/${this.id}`);
  }

}
