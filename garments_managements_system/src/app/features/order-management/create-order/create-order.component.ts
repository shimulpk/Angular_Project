import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { BuyerService } from '../../../core/services/buyer.service';
import { StyleService } from '../../../core/services/style.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { Order, OrderItem } from '../../../models/order/order.model';
import { Buyer } from '../../../models/buyer/buyer.model';
import { Style } from '../../../models/style/style.model';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-order.component.html'
})
export class CreateOrderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private buyerService = inject(BuyerService);
  private styleService = inject(StyleService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  orderForm!: FormGroup;
  buyers: Buyer[] = [];
  styles: Style[] = [];

  readonly SIZES = ['S', 'M', 'L', 'XL'];

  ngOnInit() {
    this.initForm();
    this.loadData();
    this.setupCalculations();
  }

  initForm() {
    this.orderForm = this.fb.group({
      orderId: ['', Validators.required],
      styleId: ['', Validators.required],
      status: ['Pending', Validators.required],
      buyerId: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      orderDate: [new Date().toISOString().substring(0, 10), Validators.required],
      shipDate: ['', Validators.required],

      shortSleeveItems: this.fb.array(this.createSizeArray('Short Sleeve')),
      fullSleeveItems: this.fb.array(this.createSizeArray('Full Sleeve')),

      subtotal: [{ value: 0, disabled: true }],
      vat: [0, [Validators.min(0)]],
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
    // Recalculate subtotal from item arrays
    const recalcSubtotal = () => {
      const val = this.orderForm.getRawValue();
      let subtotal = 0;

      const calcArray = (arr: any[]) => {
        if (!arr) return;
        arr.forEach(item => {
          const q = item.quantity || 0;
          const p = item.unitPrice || 0;
          subtotal += (q * p);
        });
      };

      calcArray(val.shortSleeveItems);
      calcArray(val.fullSleeveItems);

      this.orderForm.get('subtotal')?.setValue(subtotal, { emitEvent: false });

      // const vat = this.orderForm.get('vat')?.value || 0;
      // const grandTotal = subtotal + vat;
      // 1. Ekhon 'vat' bolte amra percentage bujhbo (Jemon: 5, 10, ba 15)
const vatPercentage = parseFloat(this.orderForm.get('vat')?.value) || 0;

// 2. Subtotal-er upor percentage calculate kore VAT amount ber korbo
const vatAmount = subtotal * (vatPercentage / 100);

// 3. Grand total hobe: subtotal + calculated VAT amount
const grandTotal = subtotal + vatAmount;
      this.orderForm.get('grandTotal')?.setValue(grandTotal, { emitEvent: false });
    };

    // Listen to item array changes
    this.shortSleeveItems.valueChanges.subscribe(() => recalcSubtotal());
    this.fullSleeveItems.valueChanges.subscribe(() => recalcSubtotal());

    // Listen to manual VAT changes
    this.orderForm.get('vat')?.valueChanges.subscribe(vat => {
      const subtotal = this.orderForm.get('subtotal')?.value || 0;
      const grandTotal = subtotal + (vat || 0);
      this.orderForm.get('grandTotal')?.setValue(grandTotal, { emitEvent: false });
    });

    // Listen to buyer selection to auto-populate shipping address
    this.orderForm.get('buyerId')?.valueChanges.subscribe(buyerId => {
      const buyer = this.buyers.find(b => b.id === buyerId);
      if (buyer) {
        const addressParts = [];
        if (buyer.address) addressParts.push(buyer.address);
        if (buyer.country) addressParts.push(buyer.country);
        const address = addressParts.join(', ') || '';
        this.orderForm.get('shippingAddress')?.setValue(address);
      } else {
        this.orderForm.get('shippingAddress')?.setValue('');
      }
    });
  }

  loadData() {
    this.buyerService.getBuyers().subscribe(data => this.buyers = data);
    this.styleService.getStyles().subscribe(data => this.styles = data);
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
        orderId: formValue.orderId,
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
        this.router.navigate(['/order-management/list']);
      });
    }
  }
}
