import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
// RxJS v6+
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

constructor(private http:HttpClient) {
 }

setHeaders(){
  let headers = new HttpHeaders();
  headers=headers.append('secret-key', '$2b$10$QRy8gDDrfxxF1pSRea0sSODnTMEmt21nJsXFITtbZwB8J58siWv4e');
  return headers;
}
// expenditure-https://api.jsonbin.io/b/5e8b1d660ac8b85189960752
// income-https://api.jsonbin.io/b/5e8b1dfc0ac8b85189960798
// locality-https://api.jsonbin.io/b/5e8b1e320cb49e48ce237fd1
// pincode-https://api.jsonbin.io/b/5e8b1e9c0ac8b85189960802

fetchLocality() {
  //return this.http.get('http://localhost:3000/api/locality');
  return this.http.get('https://api.jsonbin.io/b/5e8b1e320cb49e48ce237fd1',{headers: this.setHeaders()});
}

fetchPincode() {
  //return this.http.get('http://localhost:3000/api/pincode');
  return this.http.get('https://api.jsonbin.io/b/5e8b1e9c0ac8b85189960802',{headers: this.setHeaders()});
}

fetchIncome() {
  //return this.http.get('http://localhost:3000/api/income');
  return this.http.get('https://api.jsonbin.io/b/5e8b1dfc0ac8b85189960798',{headers: this.setHeaders()});
}


fetchExpenditure() {
  //return this.http.get('http://localhost:3000/api/expenditure');
  return this.http.get('https://api.jsonbin.io/b/5e8b1d660ac8b85189960752',{headers: this.setHeaders()});
}



}
