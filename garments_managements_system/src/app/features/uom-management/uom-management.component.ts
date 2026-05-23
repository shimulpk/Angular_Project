import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MerchandisingService } from '../../features/merchandising-service/merchandising.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { UOM } from '../../models/uom/uom.model';

@Component({
  selector: 'app-uom-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './uom-management.component.html',
  styleUrl: './uom-management.component.css'
})
export class UomManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private merchService = inject(MerchandisingService);
  private notify = inject(NotificationService);

  uomForm!: FormGroup;
  uoms: UOM[] = [];

  ngOnInit() {
    this.initForm();
    this.loadUOMs();
    this.setupAutoCalculation();
  }

  initForm() {
    this.uomForm = this.fb.group({
      productName: ['', Validators.required],
      size: ['M', Validators.required],
      body: [0, [Validators.required, Validators.min(0)]],
      sleeve: [0, [Validators.required, Validators.min(0)]],
      pocket: [0, [Validators.required, Validators.min(0)]],
      wastage: [0, [Validators.required, Validators.min(0)]],
      shrinkage: [0, [Validators.required, Validators.min(0)]],
      totalBaseFabric: [{ value: 0, disabled: true }]
    });
  }

  setupAutoCalculation() {
    this.uomForm.valueChanges.subscribe(val => {
      const body = val.body || 0;
      const sleeve = val.sleeve || 0;
      const pocket = val.pocket || 0;
      const wastage = val.wastage || 0;
      const shrinkage = val.shrinkage || 0;

      const total = body + sleeve + pocket + (body * (wastage / 100)) + (body * (shrinkage / 100));
      this.uomForm.get('totalBaseFabric')?.setValue(Number(total.toFixed(4)), { emitEvent: false });
    });
  }

  loadUOMs() {
    this.merchService.getUOMs().subscribe(data => {
      this.uoms = data;
    });
  }

  onSubmit() {
    if (this.uomForm.valid) {
      const uomData: UOM = {
        ...this.uomForm.getRawValue()
      };
      this.merchService.createUOM(uomData).subscribe(() => {
        this.notify.success('UOM added successfully');
        this.uomForm.reset({ size: 'M', body: 0, sleeve: 0, pocket: 0, wastage: 0, shrinkage: 0 });
        this.loadUOMs();
      });
    }
  }

  deleteUOM(id: string) {
    if (confirm('Are you sure you want to delete this UOM?')) {
      this.merchService.deleteUOM(id).subscribe(() => {
        this.notify.success('UOM deleted');
        this.loadUOMs();
      });
    }
  }
}
