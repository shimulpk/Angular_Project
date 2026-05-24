import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { BuyerService } from '../../../core/services/buyer.service';
import { StyleService } from '../../../core/services/style.service';
import { Order } from '../../../models/order/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private buyerService = inject(BuyerService);
  private styleService = inject(StyleService);

  order: Order | null = null;
  buyerName = '';
  styleCode = '';
  isLoading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    }
  }

  loadOrder(id: string) {
    this.isLoading = true;
    this.orderService.getOrderById(id).subscribe(order => {
      this.order = order;
      this.buyerService.getBuyers().subscribe(buyers => {
        const buyer = buyers.find(b => b.id === order.buyerId);
        this.buyerName = buyer ? buyer.companyName : 'Unknown';
      });
      this.styleService.getStyles().subscribe(styles => {
        const style = styles.find((s: any) => s.id === order.styleId);
        this.styleCode = style ? style.styleCode : 'Unknown';
      });
      this.isLoading = false;
    });
  }

  printOrder() {
    window.print();
  }

  get shortSleeveItems() {
    return (this.order?.items || []).filter(item => item.type === 'Short Sleeve');
  }

  get fullSleeveItems() {
    return (this.order?.items || []).filter(item => item.type === 'Full Sleeve');
  }
}
