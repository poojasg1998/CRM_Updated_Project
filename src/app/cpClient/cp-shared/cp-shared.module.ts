import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpHeaderComponent } from '../cp-header/cp-header.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [CpHeaderComponent],
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [CpHeaderComponent],
})
export class CpSharedModule {}
