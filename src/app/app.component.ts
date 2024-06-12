import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { DegreeServiceService } from './service/degree-service.service';
import { User } from './Models/User';
import { Degree } from './Models/Degree';
import { AddDegree } from './Models/AddDegree';
import { HttpClient } from '@angular/common/http';
import { DocumentTable } from './Models/DocumentTable';
 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
     
  user: User ;
  degrees: Degree[]=[];

  config: any[];
  selectedMasterType: number;
  selectedStatus: string='';
  ListOfConfigForDoc:any[];
  selectedDoc:string;
  todayDate: string;
  isNationalOrInternationalSelected: boolean = false;
  isDegreeSelected: boolean = false;

  selectedFile: File;
  documentName: string;
  receiveDate: string;
  newDegreeId: number;
  currentDegree: any
 
  @ViewChild('nationalRadioButton') nationalRadioButton;
  @ViewChild('internationalRadioButton') internationalRadioButton;
  formDataDegree :AddDegree = {
    startDate: null,
    endDate: null,
    issueDate: null
  };
  constructor(private degreeService: DegreeServiceService,private http: HttpClient,private cdr: ChangeDetectorRef){
      this.getDegreeAndUser();
      this.getListOfConfigForDoc();
    }
   
    ngOnInit(){
      this.todayDate = this.formatDate(new Date());
    }

    ngAfterViewInit() {
      this.resetFormValues();
    }

    formatDate(date: Date): string {
      const day = date.getDate();
      const month = date.getMonth() + 1;  
      const year = date.getFullYear();
  
      return `${month}/${day}/${year}`;
    }
    
    getDegreeAndUser(){
      const userId = 1;  
    this.degreeService.getUserById(userId)
        .subscribe(user => {
          this.user = user;
        
       });
      this.degreeService.getDegreeById(userId)
        .subscribe(degrees => {
          this.degrees = degrees;  
         this.degrees.forEach(degree => {
            this.degreeService.getDegreeInfo(degree.degreeId)
              .subscribe((data) => {
                degree.masterType = data.type;
                degree.value = data.value;   
              });
          });
        });
  
    }

    deleteDegreeById(degreeId: number) {
      console.log(degreeId);
      this.degreeService.deleteDegree(degreeId).subscribe();
      setTimeout(() => {
        this.getDegreeAndUser()
     }, 50);
      setTimeout(() => {
        alert('Degree successfully deleted')
       
      }, 100);
    }

  
     updateValue(element:number) {
      this.selectedMasterType = element;
       this.degreeService.getListOfConfig(element).subscribe(val=>{
        this.config = val; 
       }
      );
      if (element === 1 || element === 2) {
        this.isNationalOrInternationalSelected = true;
    } else {
        this.isNationalOrInternationalSelected = false;
    }
     
     }

     
     getListOfConfigForDoc(){
      this.degreeService.getListOfConfigForDoc(3).subscribe(val=>{
        this.ListOfConfigForDoc = val;
      })
     }
   onFileSelected(event): void {
       this.selectedFile = event.target.files[0];
     }

     async saveDocument() {
      if (!this.selectedFile) {
        console.error('No file selected.');
        return;
      }
    
      const formData = new FormData();
      formData.append('docName', this.documentName);
      formData.append('documentImage', this.selectedFile);
      formData.append('masterTypeId', '3');
      formData.append('configValue', this.selectedDoc);
      formData.append('receiveDate', this.receiveDate);
      formData.append('degreeId', '');
    
 

      try {
         
        const degreeResponse = await this.degreeService.postDegree(this.selectedMasterType, this.selectedStatus, this.formDataDegree).toPromise();
   
        this.currentDegree = degreeResponse;
    
        
        formData.set('degreeId', this.currentDegree.degreeId);
    
       
        const documentResponse = await this.degreeService.postDocument(formData).toPromise();
        console.log('Document saved successfully:', documentResponse);
        
  
        this. getDegreeAndUser();

        const notesReponse = await this.degreeService.postNotes(this.notes,this.currentDegree.degreeId).toPromise();
        console.log('Notes saved successfully:', notesReponse);
        this.notes = null;
       
       


      } catch (error) {
        console.error('Error saving document:', error);
       
      }
    }
  newNote: string;
      notes: { note: string }[] = [];
    
      saveNote() {
        if (this.newNote) {
          this.notes.push({ note: this.newNote });
          this.newNote = "";  
        
        }
        console.log(this.notes);
      }

      deleteNote(index: number): void {
        this.notes.splice(index, 1);
      }

      isFormInvalid(): boolean {
        return !this.selectedDoc || !this.documentName || !this.receiveDate || !this.selectedMasterType || !this.selectedStatus;
      }

 onDegreeSelected() {
  if(this.selectedStatus){
    this.isDegreeSelected = true;
  }
  
}
resetFormValues() {
  this.selectedStatus = null;
    this.formDataDegree.startDate = null;
    this.formDataDegree.endDate = null;
    this.formDataDegree.issueDate = null;
    this.isDegreeSelected = false;
    this.isNationalOrInternationalSelected = false;
    this.nationalRadioButton.nativeElement.checked = false;
    this.internationalRadioButton.nativeElement.checked = false;
    this.selectedDoc = null;
    this.isDocListSelected = false
     this.notes = [];
    this.newNote = '';
    this.cdr.detectChanges();
 
}

isDocListSelected:boolean = false;

onDocSelected(){
  if(this.selectedDoc){
    this.isDocListSelected = true;
  }else{
    this.isDocListSelected = false;
  }
  
}


 

    
    }

  
