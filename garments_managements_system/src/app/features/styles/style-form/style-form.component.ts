import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StyleService } from '../style-service/style.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { BuyerService } from '../../buyers/buyer-service/buyer.service';
import { Buyer } from '../../../models/buyer/buyer.model';
@Component({
  selector: 'app-style-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './style-form.component.html',
  styleUrl: './style-form.component.css'})
export class StyleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private styleService = inject(StyleService);
  private buyerService = inject(BuyerService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  styleForm!: FormGroup;
  buyers: Buyer[] = [];
  isEdit = false;
  styleId: string | null = null;
  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38'];
  selectedSizes: string[] = [];

  ngOnInit() {
    this.initForm();
    this.loadBuyers();
    
    this.styleId = this.route.snapshot.paramMap.get('id');
    if (this.styleId && this.styleId !== 'new') {
      this.isEdit = true;
      this.loadStyle();
    }
  }

  initForm() {
    this.styleForm = this.fb.group({
      styleCode: ['', Validators.required],
      styleName: ['', Validators.required],
      buyerId: ['', Validators.required],
      season: ['Spring 2024'],
      garmentType: ['T-Shirt'],
      gender: ['Men'],
      approvalStatus: ['Draft']
    });
  }

  loadBuyers() {
    this.buyerService.getBuyers().subscribe(data => this.buyers = data);
  }

  loadStyle() {
    this.styleService.getStyleById(this.styleId!).subscribe(style => {
      this.styleForm.patchValue(style);
      this.selectedSizes = style.sizeSet || [];
    });
  }

  toggleSize(size: string) {
    const idx = this.selectedSizes.indexOf(size);
    if (idx > -1) {
      this.selectedSizes.splice(idx, 1);
    } else {
      this.selectedSizes.push(size);
    }
  }

  isSizeSelected(size: string): boolean {
    return this.selectedSizes.includes(size);
  }

  save() {
    if (this.styleForm.valid) {
      const data = {
        ...this.styleForm.value,
        sizeSet: this.selectedSizes,
        imageUrl: this.isEdit ? undefined : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&auto=format&fit=crop'
      };

      if (this.isEdit) {
        this.styleService.updateStyle(this.styleId!, data).subscribe(() => {
          this.notify.success('Style updated successfully');
          this.router.navigate(['/styles']);
        });
      } else {
        this.styleService.createStyle(data).subscribe(() => {
          this.notify.success('New style added to library');
          this.router.navigate(['/styles']);
        });
      }
    }
  }
}
