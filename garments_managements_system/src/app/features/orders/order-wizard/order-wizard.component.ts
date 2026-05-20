import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../order-service/order.service';
import { BuyerService } from '../../buyers/buyer-service/buyer.service';
import { StyleService } from '../../styles/style-service/style.service';
import { Buyer } from '../../../models/buyer/buyer.model';
import { Style } from '../../../models/style/style.model';
import { Order } from '../../../models/order/order.model';
import { NotificationService } from '../../../core/services/notification/notification.service';
@Component({
  selector: 'app-order-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './order-wizard.component.html',
  styleUrl: './order-wizard.component.css'})
export class OrderWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private buyerService = inject(BuyerService);
  private styleService = inject(StyleService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentStep = 1;
  orderForm!: FormGroup;
  buyers: Buyer[] = [];
  styles: Style[] = [];
  filteredStyles: Style[] = [];
  isEditMode = false;
  orderId?: string;

  ngOnInit() {
    this.initForm();
    this.loadData();
    this.checkEditMode();
  }

  initForm() {
    this.orderForm = this.fb.group({
      poNumber: ['', Validators.required],
      buyerId: ['', Validators.required],
      styleId: ['', Validators.required],
      orderDate: [new Date().toISOString().split('T')[0]],
      shipDate: ['', Validators.required],
      status: ['DRAFT'],
      totalQuantity: [0],
      totalAmount: [0],
      items: this.fb.array([])
    });

    this.addItem();

    // Listen to buyerId changes to filter styles
    this.orderForm.get('buyerId')?.valueChanges.subscribe(buyerId => {
      this.filterStyles(buyerId);
      
      // Reset styleId if the current style does not match the new buyer
      const currentStyleId = this.orderForm.get('styleId')?.value;
      if (currentStyleId) {
        const currentStyle = this.styles.find(s => s.id === currentStyleId);
        if (!currentStyle || currentStyle.buyerId !== buyerId) {
          this.orderForm.get('styleId')?.setValue('');
        }
      }
    });
  }

  get items() {
    return this.orderForm.get('items') as FormArray;
  }

  addItem() {
    const itemForm = this.fb.group({
      color: ['', Validators.required],
      size: ['M', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });
    this.items.push(itemForm);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateTotals();
  }

  loadData() {
    this.buyerService.getBuyers().subscribe(data => this.buyers = data);
    this.styleService.getStyles().subscribe(data => {
      this.styles = data;
      const currentBuyerId = this.orderForm.get('buyerId')?.value;
      if (currentBuyerId) {
        this.filterStyles(currentBuyerId);
      }
    });
  }

  filterStyles(buyerId: string) {
    if (!buyerId || !this.styles.length) {
      this.filteredStyles = [];
    } else {
      this.filteredStyles = this.styles.filter(style => style.buyerId === buyerId);
    }
  }

  checkEditMode() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.orderId = id;
        this.orderService.getOrderById(id).subscribe({
          next: (order) => {
            this.orderForm.patchValue({
              poNumber: order.poNumber,
              buyerId: order.buyerId,
              styleId: order.styleId,
              orderDate: order.orderDate,
              shipDate: order.shipDate,
              status: order.status,
              totalQuantity: order.totalQuantity,
              totalAmount: order.totalAmount
            });

            this.items.clear();
            if (order.items && order.items.length > 0) {
              order.items.forEach(item => {
                const itemForm = this.fb.group({
                  color: [item.color, Validators.required],
                  size: [item.size, Validators.required],
                  quantity: [item.quantity, [Validators.required, Validators.min(1)]],
                  unitPrice: [item.unitPrice, [Validators.required, Validators.min(0.01)]]
                });
                this.items.push(itemForm);
              });
            } else {
              this.addItem();
            }

            if (this.styles.length > 0) {
              this.filterStyles(order.buyerId);
            }
            this.calculateTotals();
          },
          error: (err) => {
            this.notify.error('Failed to load purchase order details');
          }
        });
      }
    });
  }

  isStepValid(): boolean {
    if (this.currentStep === 1) {
      return !!this.orderForm.get('poNumber')?.valid && 
             !!this.orderForm.get('styleId')?.valid && 
             !!this.orderForm.get('buyerId')?.valid;
    }
    if (this.currentStep === 2) {
      return this.items.length > 0 && this.items.valid;
    }
    return true;
  }

  calculateTotals() {
    let qty = 0;
    let amt = 0;
    this.items.controls.forEach(control => {
      const q = control.get('quantity')?.value || 0;
      const p = control.get('unitPrice')?.value || 0;
      qty += q;
      amt += (q * p);
    });
    this.orderForm.patchValue({ totalQuantity: qty, totalAmount: amt });
  }

  submit() {
    if (this.orderForm.valid) {
      if (this.isEditMode && this.orderId) {
        this.orderService.updateOrder(this.orderId, this.orderForm.value).subscribe({
          next: () => {
            this.notify.success('PO Updated Successfully');
            this.router.navigate(['/orders']);
          },
          error: () => {
            this.notify.error('Failed to update PO');
          }
        });
      } else {
        this.orderService.createOrder(this.orderForm.value).subscribe({
          next: () => {
            this.notify.success('PO Created Successfully');
            this.router.navigate(['/orders']);
          },
          error: () => {
            this.notify.error('Failed to create PO');
          }
        });
      }
    }
  }
}
