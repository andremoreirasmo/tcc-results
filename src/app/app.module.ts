import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxCSVtoJSONModule } from 'ngx-csvto-json';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgApexchartsModule,
    HttpClientModule,
    NgxCSVtoJSONModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
