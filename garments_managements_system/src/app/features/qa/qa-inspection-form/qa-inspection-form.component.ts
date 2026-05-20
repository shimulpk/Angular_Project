import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { QAService } from '../qa-service/qa.service';
import { OrderService } from '../../orders/order-service/order.service';
import { ProductionService } from '../../production/production-service/production.service';
import { Order } from '../../../models/order/order.model';
import { ProductionLine } from '../../../models/production/production.model';
import { QAInspection, Defect } from '../../../models/qa/qa.model';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-qa-inspection-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './qa-inspection-form.component.html',
  styleUrl: './qa-inspection-form.component.css'})
export class QAInspectionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private qaService = inject(QAService);
  private orderService = inject(OrderService);
  private prodService = inject(ProductionService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  qaForm!: FormGroup;
  orders: Order[] = [];
  lines: ProductionLine[] = [];

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.qaForm = this.fb.group({
      orderId: ['', Validators.required],
      poNumber: [''],
      lineId: ['', Validators.required],
      inspectionType: ['Inline'],
      checkQty: [0, [Validators.required, Validators.min(1)]],
      passQty: [0],
      failQty: [0],
      defects: this.fb.array([]),
      dhu: [0],
      inspector: [''],
      date: [new Date().toISOString().split('T')[0]]
    });
  }

  get defects() {
    return this.qaForm.get('defects') as FormArray;
  }

  addDefect() {
    const defectForm = this.fb.group({
      type: ['Broken Stitch', Validators.required],
      count: [0, [Validators.required, Validators.min(1)]]
    });
    this.defects.push(defectForm);
  }

  removeDefect(index: number) {
    this.defects.removeAt(index);
    this.calculateMetrics();
  }

  loadData() {
    this.orderService.getOrders().subscribe((data: Order[]) => this.orders = data);
    this.prodService.getProductionLines().subscribe((data: ProductionLine[]) => this.lines = data);
  }

  onOrderSelect() {
    const id = this.qaForm.get('orderId')?.value;
    const order = this.orders.find(o => o.id === id);
    if (order) this.qaForm.patchValue({ poNumber: order.poNumber });
  }

  calculateMetrics() {
    const checkQty = this.qaForm.get('checkQty')?.value || 0;
    const failQty = this.qaForm.get('failQty')?.value || 0;
    
    // Auto calculate pass qty if check and fail are given
    if (checkQty > 0) {
      this.qaForm.patchValue({ passQty: checkQty - failQty }, { emitEvent: false });
    }

    // Calculate DHU
    let totalDefects = 0;
    this.defects.controls.forEach(c => totalDefects += c.get('count')?.value || 0);
    
    if (checkQty > 0) {
      const dhu = (totalDefects / checkQty) * 100;
      this.qaForm.patchValue({ dhu: parseFloat(dhu.toFixed(2)) }, { emitEvent: false });
    }
  }

  save() {
    if (this.qaForm.valid) {
      this.qaService.createInspection(this.qaForm.value).subscribe(() => {
        this.notify.success('QA Report Submitted');
        this.router.navigate(['/qa']);
      });
    }
  }
}
