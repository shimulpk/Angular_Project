import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MerchandisingService } from '../../../features/merchandising-service/merchandising.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { Uom } from '../../../models/uom/uom.model';

@Component({
  selector: 'app-uom-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './uom-list.component.html'
})
export class UomListComponent implements OnInit {
  private merchService = inject(MerchandisingService);
  private notify = inject(NotificationService);

  uoms: Uom[] = [];

  ngOnInit() {
    this.loadUOMs();
  }

  loadUOMs() {
    this.merchService.getUOMs().subscribe(data => {
      this.uoms = data;
    });
  }

  deleteUOM(id: string) {
    if (confirm('Are you sure you want to delete this UOM?')) {
      this.merchService.deleteUOM(id).subscribe(() => {
        this.notify.success('UOM deleted');
        this.loadUOMs();
      });
    }
  }
}
