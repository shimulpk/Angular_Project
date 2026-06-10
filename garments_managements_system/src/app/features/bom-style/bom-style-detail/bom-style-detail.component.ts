import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MerchandisingService } from '../../merchandising-service/merchandising.service';
import { BomView } from '../../../models/bom-view/bom-view.model';

@Component({
  selector: 'app-bom-style-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bom-style-detail.component.html'
})
export class BomStyleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private merchService = inject(MerchandisingService);

  styleCode: string = '';
  bomItems: BomView[] = [];
  isLoading = true;

  get totalCost(): number {
    return this.bomItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  }

  ngOnInit() {
    this.styleCode = this.route.snapshot.paramMap.get('styleCode') || '';
    this.loadBOMItems();
  }

  loadBOMItems() {
    this.isLoading = true;
    this.merchService.getAllBOMItems().subscribe(data => {
      this.bomItems = data.filter(item => item.styleCode === this.styleCode);
      this.isLoading = false;
    });
  }
}
