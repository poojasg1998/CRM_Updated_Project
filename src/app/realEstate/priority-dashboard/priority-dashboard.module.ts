import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { PriorityDashboardComponent } from './priority-dashboard.component';
import { SharedModule } from '../shared.module';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  imports: [
    CommonModule,
    NgOtpInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: PriorityDashboardComponent,
      },
    ]),
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    DropdownModule,
    FormsModule,
  ],
  declarations: [PriorityDashboardComponent],
})
export class PriorityDashboardModule {}
