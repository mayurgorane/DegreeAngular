import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { DegreeServiceService } from './service/degree-service.service';
import { User } from './Models/User';
import { Degree } from './Models/Degree';
import { AddDegree } from './Models/AddDegree';
import { HttpClient } from '@angular/common/http';
import { DocumentTable } from './Models/DocumentTable';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  user: User;
  degrees: Degree[] = [];

  config: any[];
  selectedMasterType: number;
  selectedStatus: string = '';
  ListOfConfigForDoc: any[];
  selectedDoc: string = '';
  todayDate: string;
  isNationalOrInternationalSelected: boolean = false;
  isDegreeSelected: boolean = false;

  selectedFile: File = null;
  documentName: string;
  receiveDate: string;
  newDegreeId: number;
  currentDegree: any;
  isDocListSelected: boolean = false;

  @ViewChild('nationalRadioButton') nationalRadioButton;
  @ViewChild('internationalRadioButton') internationalRadioButton;
  formDataDegree: AddDegree = {
    startDate: null,
    endDate: null,
    issueDate: null,
  };
  constructor(
    private degreeService: DegreeServiceService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.getDegreeAndUser();
    this.getListOfConfigForDoc();
  }

  ngOnInit() {
    this.todayDate = this.formatDate(new Date());

   
  }

  ngAfterViewInit() {
    this.resetFormValues();
    this.cdr.detectChanges();
  }
  
  formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  getDegreeAndUser() {
    const userId = 1;
    this.degreeService.getUserById(userId).subscribe((user) => {
      this.user = user;
    });
    this.degreeService.getDegreeById(userId).subscribe((degrees) => {
      this.degrees = degrees;
      this.degrees.forEach((degree) => {
        this.degreeService.getDegreeInfo(degree.degreeId).subscribe((data) => {
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
      this.getDegreeAndUser();
    }, 50);
    setTimeout(() => {
      alert('Degree successfully deleted');
    }, 100);
  }

  updateValue(element: number) {
    this.selectedMasterType = element;
    this.degreeService.getListOfConfig(element).subscribe((val) => {
      this.config = val;
    });
    if (element === 1 || element === 2) {
      this.isNationalOrInternationalSelected = true;
    } else {
      this.isNationalOrInternationalSelected = false;
    }
  }

  getListOfConfigForDoc() {
    this.degreeService.getListOfConfigForDoc(3).subscribe((val) => {
      this.ListOfConfigForDoc = val;
    });
  }
  onFileSelected(event): void {
    this.selectedFile = event.target.files[0];
  }

  formData: FormData = new FormData();

  async saveDocument() {
    if (!this.selectedFile) {
      console.error('No file selected.');
   
      return;
    }
    if (!this.checkDateValidations()) {
      console.log('Invalid dates');
      alert('Invalid Values')
    }else{
     
    this.formData.append('docName', this.documentName);
    this.formData.append('documentImage', this.selectedFile);
    this.formData.append('masterTypeId', '3');
    this.formData.append('configValue', this.selectedDoc);
    this.formData.append('receiveDate', this.receiveDate);
    this.formData.append('degreeId', '');
    try {
      const degreeResponse = await this.degreeService
        .postDegree(
          this.selectedMasterType,
          this.selectedStatus,
          this.formDataDegree
        )
        .toPromise();

      this.currentDegree = degreeResponse;

      this.formData.set('degreeId', this.currentDegree.degreeId);

      const documentResponse = await this.degreeService
        .postDocument(this.formData)
        .toPromise();
      console.log('Document saved successfully:', documentResponse);

      this.getDegreeAndUser();

      const notesReponse = await this.degreeService
        .postNotes(this.notes, this.currentDegree.degreeId)
        .toPromise();
      console.log('Notes saved successfully:', notesReponse);
      this.notes = null;

      this.resetFormValues();
    } catch (error) {
      console.error('Error saving document:', error);
    }

    this.resetFormValues();
    this.receiveDate = '';
    this.selectedFile = null;

  }


  }
  newNote: string;
  version:number;
  groupId:number;
  notes: { note: string,version?:number,groupId?:number }[] = [];
  


  

  isFormInvalid(): boolean {
    return (
      !this.selectedDoc ||
      !this.documentName ||
      !this.receiveDate ||
      !this.selectedMasterType ||
      !this.selectedStatus || 
      this.selectedDoc == '' ||  this.selectedDoc == null ||
      !this.formDataDegree.startDate || this.formDataDegree.startDate == null || 
      !this.formDataDegree.issueDate ||  this.formDataDegree.endDate == null || 
      !this.formDataDegree.endDate || this.formDataDegree.issueDate == null  
    );


  }

  onDegreeSelected() {
    if (this.selectedStatus) {
      this.isDegreeSelected = true;
    }
  }
  resetFormValues() {
    this.selectedStatus = '';
    this.formDataDegree.startDate = null;
    this.formDataDegree.endDate = null;
    this.formDataDegree.issueDate = null;
    this.isDegreeSelected = false;
    this.isNationalOrInternationalSelected = false;
    this.nationalRadioButton.nativeElement.checked = false;
    this.internationalRadioButton.nativeElement.checked = false;

    this.isDocListSelected = false;
    this.notes = [];
    this.newNote = '';
    this.updateDegree = null;
    this.selectedFile = null;
    this.receiveDate = '';

    this.documentName = '';
    this.selectedDoc = '';
  }

  onDocSelected() {
    if (this.selectedDoc !== '') {
      this.isDocListSelected = true;
    } else {
      this.isDocListSelected = false;
    }
  }

  updateDegree: Degree;
  DocumentByDegreeId: any;
  degreeId: number;
  load:any;
  
  downloadImage() {
    const url = `http://192.168.21.39:9090/api/documents/download/${this.degreeId}`;

    this.http.get(url, { responseType: 'blob' }).subscribe(
      (response: Blob) => {
        const blob = new Blob([response]);
        const contentType = response.type;
        let fileExtension = 'unknown';
        if (contentType.includes('image/jpeg')) {
          fileExtension = 'jpg';
        } else if (contentType.includes('image/png')) {
          fileExtension = 'png';
        } else if (contentType.includes('image/gif')) {
          fileExtension = 'gif';
        } else if (contentType.includes('application/pdf')) {
          fileExtension = 'pdf';
        }
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `document.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
       },
       (error) => {
         console.error('Error downloading image:', error);
       }
    );
  }


  getnotes:any=[];

  update(degree: any) {
    this.degreeId = degree.degreeId;
    this.formDataDegree.startDate = degree.startDate;
    this.formDataDegree.endDate = degree.endDate;
    this.formDataDegree.issueDate = degree.issueDate;
    this.updateDegree = degree;

    if (degree.masterType === 'National') {
      this.selectedMasterType = 1;
      this.nationalRadioButton.nativeElement.checked = true;
    } else {
      this.selectedMasterType = 2;
      this.internationalRadioButton.nativeElement.checked = true;
    }

    this.degreeService.getDocumentByDegreeId(degree.degreeId).subscribe((temp) => {
        this.receiveDate = temp.receivedDate;
        this.documentName = temp.docName;
        this.selectedDoc = temp.configTable.value;
        this.load = temp;  
      
        if (this.selectedDoc) {
          this.isDocListSelected = true;
        }
      });

    this.updateValue(this.selectedMasterType);

    setTimeout(() => {
      this.selectedStatus = degree.value;
      this.onDegreeSelected();
      this.cdr.detectChanges();
    }, 0);

    this.degreeService.getNotes(degree.degreeId).subscribe((temp)=>{
      this.getnotes = temp;
      
    }
 
    )
  
  }
  finalArray: any[] = [];

   updateDoc() {
    const temp1 = this.load;
  
    this.degreeService.updateDegree(this.degreeId, this.selectedMasterType, this.selectedStatus, this.formDataDegree)
      .subscribe(
        response => {
          this.getDegreeAndUser();
          this.resetFormValues();
        },
        error => {
          this.getDegreeAndUser();
        }
      );
  
    const formDataDocument: FormData = new FormData();
    formDataDocument.append('masterId', '3');
    formDataDocument.append('docName', this.documentName);
    formDataDocument.append('documentImage', this.selectedFile);
    formDataDocument.append('value', this.selectedDoc);
    formDataDocument.append('receiveDate', this.receiveDate);
  
    this.degreeService.updateDocument(temp1.id, formDataDocument).subscribe(() => {
      this.getDegreeAndUser();
      this.resetFormValues();
    });
  
    document.getElementById('degreeModal').setAttribute('display', 'none');
    
    this.finalArray = [...this.saveNotes, ...this.notes];
      
    this.degreeService.deletePostUpdateNotes(this.degreeId,this.finalArray).subscribe( (temp)=>{
      console.log(temp);
       this.finalArray = null;

       this.saveNotes = [];
       this.notes = [];
       this.getDegreeAndUser();
    } 
    );
     
  }
   saveNotes: any[] = [];
   isNoteThere: boolean = false;


  checkNote() {
    this.isNoteThere = this.newNote.trim().length > 0;
   
  }

  saveNote() {
   
    if (this.isNoteThere && this.newNote ) {
      this.isNoteThere = true
      this.getnotes.push({ note: this.newNote});
      this.saveNotes.push({ note: this.newNote});
      this.newNote = '';
    }  
    console.log(this.saveNotes);
  }
   deleteNote(i: number,note:any): void {
    const delteNote = this.getnotes[i];
  
    if (delteNote.version !== undefined && delteNote.groupId !== undefined && delteNote.note) {
      this.notes.push({
        note: delteNote.note,
        version: delteNote.version,
        groupId: delteNote.groupId
        });
   
    } 
    
    console.log(i) 
     this.getnotes.splice(i, 1);
    this.saveNotes.splice(note, 1);
    console.log(this.saveNotes);
 
  }
 
  editedNote: any[] = [];

  editNote(i: number): void {
 
  }

  checkDateValidations(): boolean {
    const startDate = new Date(this.formDataDegree.startDate);
    const endDate = new Date(this.formDataDegree.endDate);
    const issueDate = new Date(this.formDataDegree.issueDate);

    if (startDate > endDate || endDate > issueDate) {
      return false;
    }

    return true;
  }

  

}
