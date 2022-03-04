import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from "../authentication.service";
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})


export class NavigationComponent implements OnInit {

  constructor(private auth:AuthenticationService) { }
  email:string;
  ngOnInit(): void {

    this.email = this.auth.getCredentials()?.email || "";
  }

  signout(){
    this.auth.signOut();
  }

}
