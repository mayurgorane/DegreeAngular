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
import { empty } from 'rxjs';

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
  startDateGreaterThanEndDate: boolean = false;
  endDateGreaterThanIssueDate: boolean = false;
  isDateValid: boolean = true;

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
    this.degreeService.deleteDegree(degreeId).subscribe(() => {
      setTimeout(() => {
        this.getDegreeAndUser();
        alert('Degree successfully deleted');
      }, 100);
    });
  }

  updateValue(element: number) {
    this.selectedMasterType = element;
    this.degreeService.getListOfConfig(element).subscribe((val) => {
      this.config = val;
    });
    this.isNationalOrInternationalSelected = (element === 1 || element === 2);
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

  newNote: string;
  version: number;
  groupId: number;
  notes: { note: string, version?: number, groupId?: number }[] = [];

  isFormInvalid(): boolean {
    const isStringFieldInvalid = (field: string): boolean => !field || field.trim() === '';
    const isDateFieldInvalid = (date: Date): boolean => !date || isNaN(new Date(date).getTime());

    // Check if any string field is invalid
    if (
      isStringFieldInvalid(this.selectedDoc) ||
      isStringFieldInvalid(this.documentName) ||
      isStringFieldInvalid(this.receiveDate) ||
      isStringFieldInvalid(this.selectedStatus)
    ) {
      return true;
    }

    // Check if selectedMasterType is not set
    if (!this.selectedMasterType) {
      return true;
    }

    // Check if any date field is invalid
    if (
      isDateFieldInvalid(this.formDataDegree.startDate) ||
      isDateFieldInvalid(this.formDataDegree.endDate) ||
      isDateFieldInvalid(this.formDataDegree.issueDate)
    ) {
      return true;
    }

    // Check additional date validations using isDateValid property
    if (!this.isDateValid) {
      return true;
    }

    // If all validations pass, form is considered valid
    return false;
  }

  validateForm() {
    this.startDateGreaterThanEndDate = false;
    this.endDateGreaterThanIssueDate = false;
    this.isDateValid = true;

    const startDate = new Date(this.formDataDegree.startDate);
    const endDate = new Date(this.formDataDegree.endDate);
    const issueDate = new Date(this.formDataDegree.issueDate);

    if (startDate >= endDate) {
      this.startDateGreaterThanEndDate = true;
    }

    if (endDate >= issueDate) {
      this.endDateGreaterThanIssueDate = true;
    }

    this.isDateValid = !this.startDateGreaterThanEndDate && !this.endDateGreaterThanIssueDate;
  }

  onDegreeSelected() {
    this.isDegreeSelected = !!this.selectedStatus;
  }

  resetFormValues() {
    // Check if ViewChild elements are defined before accessing nativeElement
    if (this.nationalRadioButton && this.internationalRadioButton) {
      this.nationalRadioButton.nativeElement.checked = false;
      this.internationalRadioButton.nativeElement.checked = false;
    }

    // Reset other form values
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

  }
  onDocSelected() {
    this.isDocListSelected = !!this.selectedDoc;
  }

  updateDegree: Degree;
  DocumentByDegreeId: any;
  degreeId: number;
  load: any;

  downloadImage() {
    const url = `http://localhost:9090/api/documents/download/${this.degreeId}`;

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

  getnotes: any = [];

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

    this.degreeService.getNotes(degree.degreeId).subscribe((temp) => {
      this.getnotes = temp;
    });
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

    this.finalArray = [...this.saveNotes, ...this.notes,...this.editedNotes];
     
    this.degreeService.deletePostUpdateNotes(this.degreeId, this.finalArray).subscribe((temp) => {
      console.log(temp);
      this.finalArray = null;

      this.saveNotes = [];
      this.notes = [];
      this.editedNotes = []; // Clear editedNotes after saving
      this.getDegreeAndUser();
    });
   
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
    console.log(this.saveNotes);
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

    console.log(i);
    this.getnotes.splice(i, 1);
    this.saveNotes.splice(note, 1);
    console.log(this.saveNotes);
  }

  editedNotes: any[] = [];
  isEditMode: boolean = false;
  editedNote: string;
  selectedEditedNote: any;
  selectedEditedNoteIndex:number;
  
  editNote(i: number) {
    this.isEditMode = true;
    this.selectedEditedNote = this.getnotes[i];
    this.selectedEditedNoteIndex = i;
    this.newNote = this.selectedEditedNote.note;
  }

  saveEditedNote() {
    this.editedNote = this.newNote;
    this.getnotes[this.selectedEditedNoteIndex].note = this.editedNote.trim();
    this.editedNotes.push({ note: this.editedNote.trim(),groupId: this.selectedEditedNote.groupId});
    this.cancelEditedNote();
     
  }

  cancelEditedNote() {
    this.isEditMode = false;
    this.newNote = '';
    this.editedNote = '';
    this.selectedEditedNote = null;
    this.selectedEditedNoteIndex = null;
  }


}
