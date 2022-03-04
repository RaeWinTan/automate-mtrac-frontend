import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultPageComponent } from './default-page/default-page.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';
import { AboutComponent } from './about/about.component';
import {AuthGuard} from "./services/auth.guard";

const routes: Routes = [
  {path: 'default',
  component: DefaultPageComponent,
  canActivate:[AuthGuard]
  },
  {path:"settings",
  component:SettingsComponent,
  canActivate:[AuthGuard]},
  {path:"login",
  component:LoginComponent},
  {path:"about", component:AboutComponent},
  {path:"", redirectTo:"/login", pathMatch:"full"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers:[AuthGuard]
})
export class AppRoutingModule {

}
