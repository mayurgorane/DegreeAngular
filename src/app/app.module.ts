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
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule for icons
 
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { VersionModalComponent } from './version-modal/version-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
 

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    VersionModalComponent 
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
