import { Component } from '@angular/core';
import { DegreeServiceService } from './service/degree-service.service';
import { User } from './Models/User';
import { Degree } from './Models/Degree';
import { AddDegree } from './Models/AddDegree';
 

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
  selectedStatus: string;
  ListOfConfigForDoc:any[];
  selectedDoc:string;
  formData:AddDegree = {
    startDate: null,
    endDate: null,
    issueDate: null
  };
  
  constructor(private degreeService: DegreeServiceService){
      this.getDegreeAndUser();
      this.getListOfConfigForDoc();
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
     
     }
    
     getVal(){
      console.log(this.formData);
      console.log(this.selectedMasterType);
      console.log(this.selectedStatus);

      this.degreeService.postDegree(this.selectedMasterType,this.selectedStatus,this.formData).subscribe(val=>{
  console.log(val);
      });
     }
 
     getListOfConfigForDoc(){
      this.degreeService.getListOfConfigForDoc(3).subscribe(val=>{
        this.ListOfConfigForDoc = val;
        console.log(this.ListOfConfigForDoc);
      })
     }
  }
