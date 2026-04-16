import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IonicStorageModule } from '@ionic/storage-angular';
import { SharedModule } from './realEstate/shared.module';
import { EchoService } from './realEstate/echo.service';
import { CpHeaderComponent } from './cpClient/cp-header/cp-header.component';
import { CpMenubarComponent } from './cpClient/cp-menubar/cp-menubar.component';
import { CpSharedModule } from './cpClient/cp-shared/cp-shared.module';
import { AuthInterceptor } from './cpClient/auth.interceptor';

@NgModule({
  declarations: [AppComponent, CpMenubarComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
    NgxMaterialTimepickerModule,
    IonicStorageModule.forRoot(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    LocalNotifications,
    EchoService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
