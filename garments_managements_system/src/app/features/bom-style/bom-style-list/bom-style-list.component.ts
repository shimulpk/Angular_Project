import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StyleService } from '../../../core/services/style.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { BomStyle } from '../../../models/bom-style/bom-style.model';

@Component({
  selector: 'app-bom-style-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bom-style-list.component.html'
})
export class BomStyleListComponent implements OnInit {
  private styleService = inject(StyleService);
  private notify = inject(NotificationService);

  styles: BomStyle[] = [];

  ngOnInit() {
    this.loadStyles();
  }

  loadStyles() {
    this.styleService.getStyles().subscribe(data => {
      this.styles = data;
    });
  }

  deleteStyle(id: string) {
    if (confirm('Are you sure you want to delete this BOM style?')) {
      this.styleService.deleteStyle(id).subscribe(() => {
        this.notify.success('BOM Style deleted');
        this.loadStyles();
      });
    }
  }
}
