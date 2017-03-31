import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

export interface ReportParameter {
  name: string;
  parameterID: number;
  value: string;
}

export interface ReportPost {
  reportId: number;
  parameters: Array<ReportParameter>;
  name: string;
}

@Injectable()
export class MyData {

  constructor(public http: Http, public user: UserData) { }
  setHeaders(){
    // the head info you wanna pass in http post
  }
  getReport(reportPost: ReportPost) {
      var url = this.myURL + "Report?reportId=" + reportPost.reportId;
      let headers = this.setHeaders();
      let postData = JSON.stringify(reportPost.parameters);
      let options = new RequestOptions({ headers: headers }); // Create a request option
      // use promise to retrieve data from server async
      return new Promise(resolve => {
        this.http.post(url, postData, options)
          .map(res => res.json())
          .subscribe(data => {
            resolve(data);
          },
          err => {
            resolve(err);
          })
      });
   }
 }
