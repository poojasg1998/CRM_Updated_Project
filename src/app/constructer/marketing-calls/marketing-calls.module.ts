import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { HeaderComponent } from '../header/header.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { MarketingCallsComponent } from './marketing-calls.component';

@NgModule({
  imports: [
    CommonModule,
    NgOtpInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: MarketingCallsComponent,
      },
    ]),
    IonicModule,
    ReactiveFormsModule,
    MultiSelectModule,
    FormsModule,
    DropdownModule,
  ],

  declarations: [MarketingCallsComponent],
})
export class MarketingCallsModule {}
