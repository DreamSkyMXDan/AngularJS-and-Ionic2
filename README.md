# AngularJS-and-Ionic2

It shows only a partial code of my hybrid mobile app. 

PDF Display Module</br></br>
It shows you how to display PDF file retrieved from server with promise on both iOS and Android Device, especially Android here.
The code is trimmed a little bit so that you have to define some of your own functions such as setHeaders().</br></br>
First, in your terminal, install ng2-pdf-viewer npm install ng2-pdf-viewer --save. Second, in the app.module.ts, add this import { PdfViewerComponent } from 'ng2-pdf-viewer', then in the NgModule declarations, add PdfViewerComponent, then you can use my module now.</br></br>
For Android, cordova has to be used to access file system and manipulate files, which is explained in the code.
