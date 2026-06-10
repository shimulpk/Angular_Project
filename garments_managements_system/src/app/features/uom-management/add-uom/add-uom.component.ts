import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MerchandisingService } from '../../../features/merchandising-service/merchandising.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { Uom } from '../../../models/uom/uom.model';

@Component({
  selector: 'app-add-uom',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-uom.component.html'
})
export class AddUomComponent implements OnInit {
  private fb = inject(FormBuilder);
  private merchService = inject(MerchandisingService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  uomForm!: FormGroup;

  ngOnInit() {
    this.initForm();
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

  onSubmit() {
    if (this.uomForm.valid) {
      const uomData: Uom = {
        ...this.uomForm.getRawValue()
      };
      this.merchService.createUOM(uomData).subscribe(() => {
        this.notify.success('UOM added successfully');
        this.router.navigate(['/uom-management/list']);
      });
    }
  }
}
