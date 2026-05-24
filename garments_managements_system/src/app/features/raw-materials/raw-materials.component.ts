import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MerchandisingService } from '../../features/merchandising-service/merchandising.service';
import { StyleService } from '../../core/services/style.service';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { Style } from '../../models/style/style.model';
import { UOM } from '../../models/uom/uom.model';

@Component({
  selector: 'app-raw-materials',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './raw-materials.component.html',
  styleUrl: './raw-materials.component.css'
})
export class RawMaterialsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private merchService = inject(MerchandisingService);
  private styleService = inject(StyleService);
  private orderService = inject(OrderService);
  private notify = inject(NotificationService);

  rawForm!: FormGroup;
  styles: Style[] = [];
  uoms: UOM[] = [];
  orders: any[] = [];

  readonly SIZES = ['S', 'M', 'L', 'XL'];
  
  calculations: any[] = [];
  totalFabricRequired: number = 0;

  ngOnInit() {
    this.initForm();
    this.loadData();
    this.setupCalculations();
  }

  initForm() {
    this.rawForm = this.fb.group({
      styleId: ['', Validators.required],
      
      short_S: [0, Validators.min(0)],
      short_M: [0, Validators.min(0)],
      short_L: [0, Validators.min(0)],
      short_XL: [0, Validators.min(0)],
      
      full_S: [0, Validators.min(0)],
      full_M: [0, Validators.min(0)],
      full_L: [0, Validators.min(0)],
      full_XL: [0, Validators.min(0)],
    });
  }

  loadData() {
    this.styleService.getStyles().subscribe(data => this.styles = data);
    this.merchService.getUOMs().subscribe(data => this.uoms = data);
    this.orderService.getOrders().subscribe(data => this.orders = data);
  }

  getUOM(productName: string, size: string): UOM | null {
    const found = this.uoms.find(u => 
      u.productName.toLowerCase().includes(productName.toLowerCase()) && 
      u.size === size
    );
    return found || null;
  }

  setupCalculations() {
    // Listen to style selection to auto-populate order sizes
    this.rawForm.get('styleId')?.valueChanges.subscribe(styleId => {
      if (!styleId) {
        this.rawForm.patchValue({
          short_S: 0, short_M: 0, short_L: 0, short_XL: 0,
          full_S: 0, full_M: 0, full_L: 0, full_XL: 0
        }, { emitEvent: true });
        return;
      }

      // Filter orders by selected styleId
      const matchingOrders = this.orders.filter(o => o.styleId === styleId);

      let shortS = 0, shortM = 0, shortL = 0, shortXL = 0;
      let fullS = 0, fullM = 0, fullL = 0, fullXL = 0;

      matchingOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const qty = Number(item.quantity) || 0;
            const size = item.size;
            const type = item.type; // 'Short Sleeve' or 'Full Sleeve'

            if (type === 'Short Sleeve') {
              if (size === 'S') shortS += qty;
              else if (size === 'M') shortM += qty;
              else if (size === 'L') shortL += qty;
              else if (size === 'XL') shortXL += qty;
            } else if (type === 'Full Sleeve') {
              if (size === 'S') fullS += qty;
              else if (size === 'M') fullM += qty;
              else if (size === 'L') fullL += qty;
              else if (size === 'XL') fullXL += qty;
            }
          });
        }
      });

      this.rawForm.patchValue({
        short_S: shortS,
        short_M: shortM,
        short_L: shortL,
        short_XL: shortXL,
        full_S: fullS,
        full_M: fullM,
        full_L: fullL,
        full_XL: fullXL
      }, { emitEvent: true });
    });

    this.rawForm.valueChanges.subscribe(val => {
      this.calculations = [];
      this.totalFabricRequired = 0;

      const types = [
        { keyPrefix: 'short_', label: 'Short Sleeve Shirt', typeStr: 'SHORT' },
        { keyPrefix: 'full_', label: 'Full Sleeve Shirt', typeStr: 'FULL' }
      ];

      types.forEach(t => {
        this.SIZES.forEach(size => {
          const qty = val[`${t.keyPrefix}${size}`] || 0;
          if (qty > 0) {
            // Find UOM
            const uom = this.getUOM(t.label, size);
            const baseFabric = uom ? uom.totalBaseFabric : 0;
            const calculated = baseFabric * qty;
            
            this.calculations.push({
              productName: t.label,
              size: size,
              type: t.typeStr,
              baseFabric: baseFabric,
              qty: qty,
              calculatedFabric: calculated,
              hasUom: !!uom
            });
            this.totalFabricRequired += calculated;
          }
        });
      });
    });
  }

  onSubmit() {
    if (this.rawForm.valid && this.calculations.length > 0) {
      const selectedStyleId = this.rawForm.value.styleId;

      // Find an order that matches this style to attach orderId
      const matchingOrder = this.orders.find(o => o.styleId === selectedStyleId);

      const payload = {
        styleId: selectedStyleId,
        orderId: matchingOrder ? (matchingOrder.orderId || matchingOrder.id) : null,
        orderDbId: matchingOrder ? matchingOrder.id : null,
        orderNumber: matchingOrder ? (matchingOrder.poNumber || matchingOrder.orderId || matchingOrder.id) : null,
        date: new Date().toISOString(),
        totalFabricRequired: this.totalFabricRequired,
        details: this.calculations
      };

      this.merchService.saveRawMaterialCheck(payload).subscribe(() => {
        this.notify.success('Fabric Data Saved Successfully!');
        this.rawForm.reset();
        this.calculations = [];
        this.totalFabricRequired = 0;
        this.router.navigate(['/raw-materials/view-checks']);
      });
    } else if (this.calculations.length === 0) {
      this.notify.error('Please enter at least one quantity to calculate.');
    }
  }
}
