import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MerchandisingService } from '../../features/merchandising-service/merchandising.service';
import { StyleService } from '../../core/services/style.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { BOMItem } from '../../models/bom/bom.model';
import { Style } from '../../models/style/style.model';
import { UOM } from '../../models/uom/uom.model';

@Component({
  selector: 'app-bom-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './bom-view.component.html',
  styleUrl: './bom-view.component.css'
})
export class BomViewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private merchService = inject(MerchandisingService);
  private styleService = inject(StyleService);
  private notify = inject(NotificationService);

  bomForm!: FormGroup;
  styles: Style[] = [];
  uoms: UOM[] = [];

  ngOnInit() {
    this.initForm();
    this.loadData();
    this.setupCalculation();
  }

  initForm() {
    this.bomForm = this.fb.group({
      serial: ['', Validators.required],
      materialName: ['', Validators.required],
      unit: ['Kg', Validators.required],
      baseFabric: ['', Validators.required],
      styleCode: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      totalCost: [{ value: 0, disabled: true }]
    });
  }

  setupCalculation() {
    this.bomForm.valueChanges.subscribe(val => {
      const q = val.quantity || 0;
      const p = val.unitPrice || 0;
      const total = q * p;
      this.bomForm.get('totalCost')?.setValue(total, { emitEvent: false });
    });
  }

  loadData() {
    this.styleService.getStyles().subscribe(data => this.styles = data);
    this.merchService.getUOMs().subscribe(data => this.uoms = data);
  }

  onSubmit() {
    if (this.bomForm.valid) {
      const formData = this.bomForm.getRawValue();
      const bomItem: BOMItem = {
        materialName: formData.materialName,
        unit: formData.unit,
        consumption: 0,
        wastagePercent: 0,
        totalRequirement: 0,
        serial: formData.serial,
        baseFabric: formData.baseFabric,
        styleCode: formData.styleCode,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        totalCost: formData.totalCost
      };

      this.merchService.createBOMItem(bomItem).subscribe(() => {
        this.notify.success('BOM item added successfully');
        this.bomForm.reset({ unit: 'Kg', quantity: 0, unitPrice: 0 });
      });
    }
  }
}
