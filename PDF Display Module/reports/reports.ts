import { Component, ViewChild, ElementRef } from '@angular/core';

import { AlertController, Loading, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';

import { MyData, Order, ReportParameter, ReportPost } from '../../providers/my-data';
import { PlatformLocation } from '@angular/common'

declare var cordova: any;
declare const resolveLocalFileSystemURL: any;

@Component({
  templateUrl: 'reports.html',
  selector: 'reports'
})
export class ReportsPage {
  item: any;
  loading: Loading;
  order: Order;
  fs: string;
  fileName: string = "report.pdf";
  @ViewChild('pdfReport') pdfReport: ElementRef;
  pdfurl: string;

  constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public platfrom: Platform,
        public myData: MyData,
        public location: PlatformLocation) {
          // get my order object
    this.order = this.navParams.data;
    location.onPopState(() => {
        console.log('pressed back!');
    });
  }

  showLoading(message) {
      this.loading = this.loadingCtrl.create({
        content: message
      });

      this.loading.present();
  }

  presentAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['Close']
    });
    alert.present();
  }

  ionViewWillLeave() {
    //console.log("Looks like I'm about to leave :(");
    // delete exisitng report.pdf
    this.deletePDF();
  }
  // save the pdf to local and display it 
  savePDF(folderPath, fileName, content, contentType) {
    // Convert the base64 string in a Blob
    var DataBlob = this.b64toBlob(content, contentType, 0);
    
    resolveLocalFileSystemURL(folderPath, (dir) => {
      console.log('Access to the directory granted succesfully');
      dir.getFile(fileName, {create: true}, (file) => {
          console.log('File created succesfully.');
          file.createWriter((fileWriter) => {
              console.log('Writing content to file', fileWriter);
              fileWriter.onwriteend = (e) => {
                DataBlob = null;
                console.log('Write completed.', e);
                this.displayPDF(this.pdfReport);
              };
              fileWriter.write(DataBlob);
          }, () => {
            alert('Unable to save file in path ' + folderPath);
          });

      });
    });
  }

  // delete the local pdf 
  deletePDF() {
    var folderPath = this.fs;
    if (!this.platfrom.is('android') || folderPath == null || folderPath.length == 0) {
      return;
    }
    
    resolveLocalFileSystemURL(folderPath, (dir) => {
      console.log('Access to the directory granted succesfully');
      dir.getFile(this.fileName, {create: false}, (file) => {

        file.remove(function(){
            console.log("remove finished");
        },function(error){
            console.log("error deleting the file");
            // Error deleting the file
        },function(){
            console.log("no file here");
        });
      }, (error) => {
            console.log("error get file");
      });
    });
  }
  // read file into text, not used in my app though
  readFile(fileEntry, text) {
        fileEntry.file(function (file) {
          var reader = new FileReader();
          reader.onloadend = function() {
              console.log("Successful file read: " + this.result);
              text.nativeElement.value = this.result;
          };
          reader.readAsText(file);
        });
  }
  // display the pdf
  displayPDF(pdf : ElementRef){
    var nativePath = this.fs + this.fileName;
    // assign path to pdfurl in the view
    this.pdfurl = nativePath;
  }

  b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  getReport() {
    this.showLoading('Loading...');
    var reportPost = <ReportPost> {};
    var reportParam = <ReportParameter> {};
    reportParam.name = 'ord';
    reportParam.value = String(this.order.orderNumber);
    reportPost.parameters = new Array<ReportParameter>();
    reportPost.parameters.push(reportParam);
    reportPost.reportId = -1;
    this.myData.getReport(reportPost).then((data:any) => {
      this.loading.dismiss();
      if (data.base64EncodedValue) {
        var report =  "data:application/pdf;base64," + data.base64EncodedValue;
        
        if (this.platfrom.is('android')) {
          // get the directory
          this.fs = cordova.file.dataDirectory;
          //Split the base64 string in data and contentType
          var block = report.split(";");
          // Get the content type
          var dataType = block[0].split(":")[1];
          // get the real base64 content of the file
          var realData = block[1].split(",")[1];
          this.savePDF(this.fs, this.fileName, realData, dataType);
        } else if (this.platfrom.is('ios')) {
          this.pdfReport.nativeElement.src = report;
        } else {
          window.open(report);
        }
      }
    });
  }
}
