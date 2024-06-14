import { Injector, NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NavbarComponent } from './navbar/navbar.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_LOCALE } from '@angular/material/core';

 
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
 

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
   BrowserModule,
   FormsModule,

   BrowserAnimationsModule,
    MatNativeDateModule,
   ReactiveFormsModule
 
  
    
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'hi-IN' }, // Use 'hi-IN' for Hindi - India locale
    
    provideHttpClient(
      withFetch() 
      
    ),
  
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})

export class AppModule { 
    
}
