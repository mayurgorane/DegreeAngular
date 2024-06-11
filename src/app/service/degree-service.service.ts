import { Injectable } from '@angular/core';
 
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../Models/User';
import { Degree } from '../Models/Degree';
import { AddDegree } from '../Models/AddDegree';

 

@Injectable({
  providedIn: 'root'
})
export class DegreeServiceService {

  constructor(private http: HttpClient) { }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`http://localhost:9090/api/users/${userId}`);
      
  }

  getDegreeById(userId: number): Observable<Degree[]> {
    return this.http.get<Degree[]>(`http://localhost:9090/degree/user/${userId}`);
      
  }

  getDegreeInfo(degreeId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:9090/degree/${degreeId}/degreeInfo`);
      
  }

  deleteDegree(degreeId: number): Observable<void>{
    return this.http.delete<any>(`http://localhost:9090/degree/${degreeId}`);
  }

  getListOfConfig(masterId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:9090/api/mastertypes/${masterId}/config`);
      
  }

  postDegree(masterType:number , value: string, data: AddDegree): Observable<AddDegree> {
   return  this.http.post<AddDegree>(`http://localhost:9090/degree/userId/1/masterId/${masterType}/value/${value}`, data);
      
  }
  getListOfConfigForDoc(masterId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:9090/api/mastertypes/3/config`);
      
  }

}
