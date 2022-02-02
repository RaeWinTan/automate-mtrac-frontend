import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultPageComponent } from './default-page/default-page.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';
const routes: Routes = [
  { path: 'default', component: DefaultPageComponent },
  {path:"settings", component:SettingsComponent},
  {path:"login", component:LoginComponent},
  {path:"", redirectTo:"/login", pathMatch:"full"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
