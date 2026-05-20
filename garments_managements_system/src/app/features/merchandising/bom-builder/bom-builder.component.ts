import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MerchandisingService } from '../merchandising-service/merchandising.service';
import { StyleService } from '../../styles/style-service/style.service';
import { BOM, BOMItem } from '../../../models/bom/bom.model';
import { Style } from '../../../models/style/style.model';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-bom-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bom-builder.component.html',
  styleUrl: './bom-builder.component.css'})
export class BOMBuilderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private merchService = inject(MerchandisingService);
  private styleService = inject(StyleService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  bomForm!: FormGroup;
  styles: Style[] = [];

  ngOnInit() {
    this.initForm();
    this.loadStyles();
  }

  initForm() {
    this.bomForm = this.fb.group({
      styleId: ['', Validators.required],
      version: ['V1.0', Validators.required],
      status: ['Draft'],
      items: this.fb.array([])
    });

    this.addMaterial();
  }

  get items() {
    return this.bomForm.get('items') as FormArray;
  }

  addMaterial() {
    const itemForm = this.fb.group({
      materialName: ['', Validators.required],
      category: ['Fabric'],
      unit: ['Kg'],
      consumption: [0, [Validators.required, Validators.min(0.0001)]],
      wastagePercent: [5],
      supplier: [''],
      totalRequirement: [0]
    });
    this.items.push(itemForm);
  }

  removeMaterial(index: number) {
    this.items.removeAt(index);
  }

  loadStyles() {
    this.styleService.getStyles().subscribe(data => this.styles = data);
  }

  calculateItemTotal(index: number) {
    const group = this.items.at(index);
    const cons = group.get('consumption')?.value || 0;
    const wast = group.get('wastagePercent')?.value || 0;
    const total = cons * (1 + (wast / 100));
    group.get('totalRequirement')?.patchValue(total, { emitEvent: false });
  }

  saveBOM() {
    if (this.bomForm.valid) {
      const bomData: BOM = {
        ...this.bomForm.value,
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.merchService.createBOM(bomData).subscribe(() => {
        this.notify.success('BOM Generated Successfully');
        // Reset or navigate
        this.resetForm();
      });
    }
  }

  resetForm() {
    this.bomForm.reset({
      styleId: '',
      version: 'V1.0',
      status: 'Draft'
    });
    while (this.items.length) {
      this.items.removeAt(0);
    }
    this.addMaterial();
  }
}
