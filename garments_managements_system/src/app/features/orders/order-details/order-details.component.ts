import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../order-service/order.service';
import { BuyerService } from '../../buyers/buyer-service/buyer.service';
import { StyleService } from '../../styles/style-service/style.service';
import { Order } from '../../../models/order/order.model';
import { Buyer } from '../../../models/buyer/buyer.model';
import { Style } from '../../../models/style/style.model';
@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private buyerService = inject(BuyerService);
  private styleService = inject(StyleService);

  order: Order | null = null;
  buyerName = 'Loading...';
  styleCode = 'Loading...';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrderById(id).subscribe(data => {
        this.order = data;
        this.loadMetaData();
      });
    }
  }

  loadMetaData() {
    if (this.order) {
      this.buyerService.getBuyerById(this.order.buyerId).subscribe(b => this.buyerName = b.companyName);
      this.styleService.getStyleById(this.order.styleId).subscribe(s => this.styleCode = s.styleCode);
    }
  }
}
