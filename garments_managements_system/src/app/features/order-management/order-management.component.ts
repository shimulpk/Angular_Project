import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { BuyerService } from '../../core/services/buyer.service';
import { StyleService } from '../../core/services/style.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { Order, OrderItem } from '../../models/order/order.model';
import { Buyer } from '../../models/buyer/buyer.model';
import { Style } from '../../models/style/style.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private buyerService = inject(BuyerService);
  private styleService = inject(StyleService);
  private notify = inject(NotificationService);

  orderForm!: FormGroup;
  orders: Order[] = [];
  buyers: Buyer[] = [];
  styles: Style[] = [];

  readonly SIZES = ['S', 'M', 'L', 'XL'];
  readonly VAT_RATE = 0.15;

  ngOnInit() {
    this.initForm();
    this.loadData();
    this.setupCalculations();
  }

  initForm() {
    this.orderForm = this.fb.group({
      styleId: ['', Validators.required],
      status: ['Pending', Validators.required],
      buyerId: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      orderDate: [new Date().toISOString().substring(0, 10), Validators.required],
      shipDate: ['', Validators.required], // Delivery Date
      
      shortSleeveItems: this.fb.array(this.createSizeArray('Short Sleeve')),
      fullSleeveItems: this.fb.array(this.createSizeArray('Full Sleeve')),
      
      subtotal: [{ value: 0, disabled: true }],
      vat: [{ value: 0, disabled: true }],
      grandTotal: [{ value: 0, disabled: true }]
    });
  }

  createSizeArray(type: string) {
    return this.SIZES.map(size => this.fb.group({
      type: [type],
      size: [size],
      color: ['Default'],
      quantity: [0, [Validators.min(0)]],
      unitPrice: [0, [Validators.min(0)]]
    }));
  }

  get shortSleeveItems() { return this.orderForm.get('shortSleeveItems') as FormArray; }
  get fullSleeveItems() { return this.orderForm.get('fullSleeveItems') as FormArray; }

  setupCalculations() {
    this.orderForm.valueChanges.subscribe(val => {
      let subtotal = 0;
      let totalQty = 0;

      const calcArray = (arr: any[]) => {
        if (!arr) return;
        arr.forEach(item => {
          const q = item.quantity || 0;
          const p = item.unitPrice || 0;
          subtotal += (q * p);
          totalQty += q;
        });
      };

      calcArray(val.shortSleeveItems);
      calcArray(val.fullSleeveItems);

      const vat = subtotal * this.VAT_RATE;
      const grandTotal = subtotal + vat;

      this.orderForm.get('subtotal')?.setValue(subtotal, { emitEvent: false });
      this.orderForm.get('vat')?.setValue(vat, { emitEvent: false });
      this.orderForm.get('grandTotal')?.setValue(grandTotal, { emitEvent: false });
    });
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

  onSubmit() {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.getRawValue();
      
      const allItems: OrderItem[] = [
        ...formValue.shortSleeveItems,
        ...formValue.fullSleeveItems
      ].filter(item => item.quantity > 0);

      const totalQuantity = allItems.reduce((sum, item) => sum + Number(item.quantity), 0);

      const orderData: Order = {
        poNumber: 'ORD-' + Math.floor(Math.random() * 10000),
        buyerId: formValue.buyerId,
        styleId: formValue.styleId,
        orderDate: formValue.orderDate,
        shipDate: formValue.shipDate,
        status: formValue.status,
        items: allItems,
        totalQuantity,
        totalAmount: formValue.grandTotal,
        shippingAddress: formValue.shippingAddress,
        subtotal: formValue.subtotal,
        vat: formValue.vat,
        grandTotal: formValue.grandTotal
      };

      this.orderService.createOrder(orderData).subscribe(() => {
        this.notify.success('Order created successfully');
        this.initForm();
        this.loadData();
      });
    }
  }
}
