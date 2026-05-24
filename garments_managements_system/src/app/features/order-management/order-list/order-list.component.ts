import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { BuyerService } from '../../../core/services/buyer.service';
import { StyleService } from '../../../core/services/style.service';
import { Buyer } from '../../../models/buyer/buyer.model';
import { Style } from '../../../models/style/style.model';
import { Order } from '../../../models/order/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  private buyerService = inject(BuyerService);
  private styleService = inject(StyleService);

  orders: Order[] = [];
  buyers: Buyer[] = [];
  styles: Style[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.buyerService.getBuyers().subscribe(data => this.buyers = data);
    this.styleService.getStyles().subscribe(data => this.styles = data);
    this.orderService.getOrders().subscribe(data => this.orders = data);
  }

  getBuyerName(buyerId: string): string {
    const buyer = this.buyers.find(b => b.id === buyerId);
    return buyer ? buyer.companyName : 'Unknown';
  }

  getStyleCode(styleId: string): string {
    const style = this.styles.find(s => s.id === styleId);
    return style ? style.styleCode : 'Unknown';
  }
}
