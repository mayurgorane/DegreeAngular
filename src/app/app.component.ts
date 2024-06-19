import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { DegreeServiceService } from './service/degree-service.service';
import { User } from './Models/User';
import { Degree } from './Models/Degree';
import { AddDegree } from './Models/AddDegree';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; 
import { MatDialog } from '@angular/material/dialog';
import { VersionModalComponent } from './version-modal/version-modal.component';
 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  user: User;
  degrees: Degree[] = [];
  page: number = 0;  
  size: number = 2;  
  totalPages: number;

  config :any=[];
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
  startDateGreaterThanEndDate: boolean = false;
  endDateGreaterThanIssueDate: boolean = false;
  isDateValid: boolean = true;
  formDataDegree: AddDegree = {
    startDate: null,
    endDate: null,
    issueDate: null,
  }; 


  @ViewChild('nationalRadioButton') nationalRadioButton;
  @ViewChild('internationalRadioButton') internationalRadioButton;


  constructor(
    private degreeService: DegreeServiceService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    public dialog: MatDialog
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

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${day}-${month}-${year}`;
  }
  getDegreeAndUser() {
    const userId = 1;
    this.degreeService.getUserById(userId).subscribe((user) => {
      this.user = user;
    });
    
    this.degreeService.getDegreeById(userId, this.page, this.size).subscribe((response: any) => {
      this.degrees = response.content;
      this.totalPages = response.page.totalPages;
    
      this.degrees.forEach((degree) => {
        this.degreeService.getDegreeInfo(degree.degreeId).subscribe((data) => {
          degree.masterType = data.type;
          degree.value = data.value;
        });
      });
    }, (error) => {
      console.error('Error loading degrees:', error);
    });
  }

  deleteDegreeById(degreeId: number) {
    this.degreeService.deleteDegree(degreeId).subscribe(() => {
      setTimeout(() => {
        if (this.degrees.length === 1 && this.page > 0) {
          this.page--;
        }
        this.getDegreeAndUser(); 
      }, 100);
    });
  }
  confirmDelete(degreeId: number) {
    const confirmed = window.confirm('Are you sure you want to delete this degree?');
  
    if (confirmed) {
      this.deleteDegreeById(degreeId);
    }
  }
   
  private selectedNationalStatus: string = '';
private selectedInternationalStatus: string = '';

updateValue(element: number) {
 
  if (this.selectedMasterType === 1) {
    this.selectedNationalStatus = this.selectedStatus;
  } else if (this.selectedMasterType === 2) {
    this.selectedInternationalStatus = this.selectedStatus;
  }
  
  this.selectedMasterType = element;
  this.degreeService.getListOfConfig(element).subscribe((val) => {
    this.config = val;
  });

  if (element === 1 || element === 2) {
    this.isNationalOrInternationalSelected = true;
    if (element === 1 && this.selectedNationalStatus) {
      this.selectedStatus = this.selectedNationalStatus;
    } else if (element === 2 && this.selectedInternationalStatus) {
      this.selectedStatus = this.selectedInternationalStatus;
    } else {
      this.selectedStatus = '';
    }
  } else {
    this.isNationalOrInternationalSelected = false;
    this.selectedStatus = '';
  }

  
 
  
}
onDegreeSelected() {
  this.isDegreeSelected = !!this.selectedStatus; 

 if(!this.config.includes(this.selectedStatus)){
this.selectedNationalStatus= ''
 }if(!this.config.includes(this.selectedStatus)){
this.selectedInternationalStatus= ''
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

  async saveDocument() {
    if (!this.selectedFile) {
      console.error('No file selected.');
      return;
    }

    if (!this.isDateValid || !this.checkDateValidations()) {
      console.log('Invalid dates');
      return;
    }

    const formData = new FormData();
    formData.append('docName', this.documentName);
    formData.append('documentImage', this.selectedFile);
    formData.append('masterTypeId', '3');
    formData.append('configValue', this.selectedDoc);
    formData.append('receiveDate', this.receiveDate.toString());
    formData.append('degreeId', '');

    try {
      const degreeResponse = await this.degreeService.postDegree(
        this.selectedMasterType,
        this.selectedStatus,
        this.formDataDegree
      ).toPromise();

      this.currentDegree = degreeResponse;

      formData.set('degreeId', this.currentDegree.degreeId);

      const documentResponse = await this.degreeService.postDocument(formData).toPromise();
      console.log('Document saved successfully:', documentResponse);

      this.getDegreeAndUser();

      const notesResponse = await this.degreeService.postNotes(this.saveNotes, this.currentDegree.degreeId).toPromise();
      console.log('Notes saved successfully:', notesResponse);

      this.resetFormValues();
    } catch (error) {
      console.error('Error saving document:', error);
    }

    this.resetFormValues();
    this.receiveDate = null;

  }

  checkDateValidations(): boolean {
    const startDate = new Date(this.formDataDegree.startDate);
    const endDate = new Date(this.formDataDegree.endDate);
    const issueDate = new Date(this.formDataDegree.issueDate);

    this.isDateValid = startDate < endDate && endDate < issueDate;

    return this.isDateValid;
  }

  newNote: any;
  version: number;
  groupId: number;
  notes: { note: string, version?: number, groupId?: number }[] = [];

  isFormInvalid(): boolean {
    const isStringFieldInvalid = (field: string): boolean => !field || field.trim() === '';
    const isDateFieldInvalid = (date: Date): boolean => !date || isNaN(new Date(date).getTime());
 
    if (
      isStringFieldInvalid(this.selectedDoc) ||
      isStringFieldInvalid(this.documentName) ||
      isStringFieldInvalid(this.receiveDate) ||
      isStringFieldInvalid(this.selectedStatus)
    ) {
      return true;
    }
     if(!this.selectedFile){
      return true;
     }
 
    if (!this.selectedMasterType) {
      return true;
    }
 
    if (
      isDateFieldInvalid(this.formDataDegree.startDate) ||
      isDateFieldInvalid(this.formDataDegree.endDate) ||
      isDateFieldInvalid(this.formDataDegree.issueDate)
    ) {
      return true;
    }

    
    
    if (!this.isDateValid) {
      return true;
    }


    
    return false;
    
  }

  validateForm() {
    this.startDateGreaterThanEndDate = false;
    this.endDateGreaterThanIssueDate = false;
    this.isDateValid = true;
  
    const startDate = new Date(this.formDataDegree.startDate);
    const endDate = new Date(this.formDataDegree.endDate);
    const issueDate = new Date(this.formDataDegree.issueDate);
  
    if (this.formDataDegree.startDate && this.formDataDegree.endDate && this.formDataDegree.issueDate) {
      if (startDate >= endDate) {
        this.startDateGreaterThanEndDate = true;
      }
  
      if (endDate >= issueDate) {
        this.endDateGreaterThanIssueDate = true;
      }
  
      this.isDateValid = !this.startDateGreaterThanEndDate && !this.endDateGreaterThanIssueDate;
    }
  }


 
resetFormValues() {
  
  if (this.nationalRadioButton && this.internationalRadioButton) {
      this.nationalRadioButton.nativeElement.checked = false;
      this.internationalRadioButton.nativeElement.checked = false;
  }


  
  this.selectedStatus = '';
  this.formDataDegree.startDate = null;
  this.formDataDegree.endDate = null;
  this.formDataDegree.issueDate = null;
  this.isDegreeSelected = false;
  this.isNationalOrInternationalSelected = false;
  this.isDocListSelected = false;
  this.notes = [];
  this.newNote = '';
  this.updateDegree = null;
  this.receiveDate = '';
  this.documentName = '';
  this.selectedDoc = '';
  this.selectedFile = null;
  this.editedNotes = [];
  this.getnotes=[];
  this.isDateValid = true;
  this.selectedInternationalStatus='';
  this.selectedNationalStatus = '';

}
  onDocSelected() {
    this.isDocListSelected = !!this.selectedDoc;
  }

  updateDegree: Degree;
  DocumentByDegreeId: any;
  degreeId: number;
  load: any;

  downloadImage( ) {
   const documentId =   this.load.id ;
    const url = `http://192.168.21.39:9090/api/documents/download/${documentId}`;
  
    this.http.get(url, { responseType: 'blob' }).subscribe(
      (response: Blob) => {
        const blob = new Blob([response]);
        const contentType = response.type;
        let fileExtension = 'unknown';
  
        // Determine the file extension based on the response content type
        if (contentType.includes('image/jpeg')) {
          fileExtension = 'jpg';
        } else if (contentType.includes('image/png')) {
          fileExtension = 'png';
        } else if (contentType.includes('image/gif')) {
          fileExtension = 'gif';
        } else if (contentType.includes('application/pdf')) {
          fileExtension = 'pdf';
        }
  
        
        let fileName = `document.${fileExtension}`;
      
        const documentNameExtension =  this.load.documentNameExtension;
        console.log(this.load)
        if (documentNameExtension) {
          fileName = `document.${documentNameExtension}`;
        }
  
        const blobUrl = window.URL.createObjectURL(blob);
  
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
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

  getnotes: any = [];

  update(degree: any) {
    this.degreeId = degree.degreeId;
    this.formDataDegree.startDate = degree.startDate;
    this.formDataDegree.endDate = degree.endDate;
    this.formDataDegree.issueDate = degree.issueDate;
    this.updateDegree = degree;
    this.selectedStatus = degree.value;
  
    if (degree.masterType === 'National') {
      this.selectedMasterType = 1;
      this.nationalRadioButton.nativeElement.checked = true;
  
    }  if (degree.masterType === 'International') {
      this.selectedMasterType = 2;
      this.internationalRadioButton.nativeElement.checked = true;
  
    }
  
    this.degreeService.getDocumentByDegreeId(degree.degreeId).subscribe((temp) => {
      this.receiveDate = temp.receivedDate;
      this.documentName = temp.docName;
        this.selectedDoc = temp.configTable.value;
      this.selectedFile = temp.documentImage;
      this.load = temp;
      
  
      if (this.selectedDoc) {
        this.isDocListSelected = true;
      }
    });
  
    this.updateValue(this.selectedMasterType);
  
    setTimeout(() => {
    
      this.onDegreeSelected();
      this.cdr.detectChanges();
    }, 0);
  
    this.degreeService.getNotes(degree.degreeId).subscribe((temp) => {
      this.getnotes = temp;
    });
    this.saveNotes = [];
    this.notes = [];
    this.editedNotes = [];
    
    this.getDegreeAndUser();
  }


  
  finalArray: any[] = [];
  documentBaseName: string;
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
  
    this.degreeService.updateDocument(this.degreeId, formDataDocument).subscribe(() => {
      this.getDegreeAndUser();
      this.resetFormValues();
    });
  
   
  
    this.finalArray = [...this.saveNotes, ...this.notes, ...this.editedNotes];
  
    this.degreeService.deletePostUpdateNotes(this.degreeId, this.finalArray).subscribe((temp) => {
   
      this.finalArray = null;
  
  
    });
    this.saveNotes = [];
    this.notes = [];
    this.editedNotes = [];
  
    this.getDegreeAndUser();
    document.getElementById('degreeModal').setAttribute('display', 'none');
  }


  saveNotes: any[] = [];
  isNoteThere: boolean = false;

  checkNote() {
    this.isNoteThere = this.newNote.trim().length > 0;
  }

  saveNote() {
    if (this.isNoteThere && this.newNote.trim()) {
      this.isNoteThere = true;
      this.getnotes.push({ note: this.newNote.trim() });
      this.saveNotes.push({ note: this.newNote.trim() });
      this.newNote = '';
    }
    
    
  }

  deleteNote(i: number, note: any): void {
    const deleteNote = this.getnotes[i];

    if (deleteNote.version !== undefined && deleteNote.groupId !== undefined && deleteNote.note) {
      this.notes.push({
        note: deleteNote.note,
        version: deleteNote.version,
        groupId: deleteNote.groupId


      });
    }
    this.getnotes.splice(i, 1);
    this.saveNotes.splice(note, 1);
    
    const noteIndexInEditedNotes = this.editedNotes.findIndex(n => n.groupId === deleteNote.groupId);
    if (noteIndexInEditedNotes !== -1) {
      this.editedNotes.splice(noteIndexInEditedNotes, 1);
    }
    
  }

  editedNotes: any[] = [];
  isEditMode: boolean = false;
  editedNote: any;
  selectedEditedNote: any;
  selectedEditedNoteIndex:number;
  
  editNote(i: number) {
    this.isEditMode = true;
    this.selectedEditedNote = this.getnotes[i];
    this.selectedEditedNoteIndex = i;
    this.newNote = this.selectedEditedNote.note;
    
    // Find the note in the editedNotes array
    const editedNoteIndex = this.editedNotes.findIndex(note => 
      note.note === this.selectedEditedNote.note
    );
    
    if (editedNoteIndex !== -1) {
      // Find the index of the existing note in the saveNotes array
      const existingNoteIndex = this.saveNotes.findIndex(note => 
        note.note === this.selectedEditedNote.note 
      );
      
      if (existingNoteIndex !== -1) {
        // Replace the existing note text in saveNotes with the edited note text
        this.saveNotes[existingNoteIndex].note = this.newNote;
      }
      
      // Remove the note from the editedNotes array
      this.editedNotes.splice(editedNoteIndex, 1);
    }
  
  }

  saveEditedNote() {
    this.editedNote = this.newNote;
    const editedNoteIndex = this.editedNotes.findIndex(note => 
      note.note === this.editedNote.trim() && note.groupId === this.selectedEditedNote.groupId
    );
  
    if (editedNoteIndex !== -1) {
      // Update the existing note in editedNotes
      this.editedNotes[editedNoteIndex].note = this.editedNote.trim();
    } else {
      // Add the edited note to editedNotes
      this.editedNotes.push({ note: this.editedNote.trim(), groupId: this.selectedEditedNote.groupId });
    }
  
    // Update version and cancel editing
    this.getnotes[this.selectedEditedNoteIndex].note = this.editedNote.trim();
    if (!this.getnotes[this.selectedEditedNoteIndex].versionIncremented) {
      this.getnotes[this.selectedEditedNoteIndex].version += 1;
      this.getnotes[this.selectedEditedNoteIndex].versionIncremented = true;
    }
    this.cancelEditedNote();
  
 
  }

  cancelEditedNote() {
    this.isEditMode = false;
    this.newNote = '';
    this.editedNote = '';
    this.selectedEditedNote = null;
    this.selectedEditedNoteIndex = null;
  }

  removeFile(){
    this.selectedFile = null;
  }
  scrollToDegree(degreeId: number) {
    const element = document.getElementById('degree-' + degreeId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }
  prevPage() {
    if (this.page > 0) {
      this.page--;  
      this.getDegreeAndUser();  
    }
  }
  
 nextPage() {
  if ( this.page < this.totalPages - 1) {
    this.page++;
    this.getDegreeAndUser();
  }
}
noteVersions:any=[];
@ViewChild('noteModal') noteModal: TemplateRef<any>;

openModal(note:any) {
  if (this.updateDegree && note.version !== 1) {
    this.modalService.open(this.noteModal, { centered: true, backdrop: false });
    this.degreeService.getNoteVersions(this.degreeId,note.groupId).subscribe((res)=>{
      this.noteVersions = res;
    })
  }
}
 

 

}
