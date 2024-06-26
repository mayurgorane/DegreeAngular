import { Injector, NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NavbarComponent } from './navbar/navbar.component';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule for icons
 
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

 
import { MatDialogModule } from '@angular/material/dialog';
 
import { RouterModule, Routes } from '@angular/router';
import { JwtInterceptor } from './Models/JwtInterceptor';

 

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent 
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,

    HttpClientModule,
   BrowserModule,
   FormsModule,
   NgbModalModule,
   BrowserAnimationsModule,
    MatNativeDateModule,
   ReactiveFormsModule,
 
   NgbModule,
   MatDialogModule
  
    
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'hi-IN' },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },  // Use 'hi-IN' for Hindi - India locale
    
    provideHttpClient(
      withFetch() 
      
    ),
  
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})

export class AppModule { 
    
}
