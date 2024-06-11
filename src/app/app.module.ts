import { Injector, NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NavbarComponent } from './navbar/navbar.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
 

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
 
   BrowserModule,
   FormsModule 
    
  ],
  providers: [
    provideHttpClient(
      withFetch() 
      
    ),
  
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})

export class AppModule { 
    
}
