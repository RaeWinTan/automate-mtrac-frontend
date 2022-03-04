import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {InterceptorService } from "./interceptor.service";
import { HTTP_INTERCEPTORS,HttpClientModule  } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DefaultPageComponent } from './default-page/default-page.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';
import { NavigationComponent } from './navigation/navigation.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CounterSignComponent } from './counter-sign/counter-sign.component';
import { ClipboardModule } from 'ngx-clipboard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatAutocompleteModule, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import { AboutComponent } from './about/about.component';
@NgModule({
  declarations: [
    AppComponent,
    DefaultPageComponent,
    SettingsComponent,
    LoginComponent,
    NavigationComponent,
    CounterSignComponent,
    AboutComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    NgbModule,HttpClientModule,
    ReactiveFormsModule,
    ClipboardModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatInputModule,
     ToastrModule.forRoot({
    positionClass: 'toast-bottom-center',closeButton:true,timeOut:2000})
  ],
  providers: [{
  provide: HTTP_INTERCEPTORS,
  useClass: InterceptorService,
  multi: true
 }],
  bootstrap: [AppComponent]
})
export class AppModule { }
