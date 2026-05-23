import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StyleService } from '../../core/services/style.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { Style } from '../../models/style/style.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bom-style',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './bom-style.component.html',
  styleUrl: './bom-style.component.css'
})
export class BomStyleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private styleService = inject(StyleService);
  private notify = inject(NotificationService);

  styleForm!: FormGroup;
  styles: Style[] = [];

  ngOnInit() {
    this.initForm();
    this.loadStyles();
  }

  initForm() {
    this.styleForm = this.fb.group({
      styleCode: ['', Validators.required],
      styleType: ['Casual', Validators.required],
      description: ['']
    });
  }

  loadStyles() {
    this.styleService.getStyles().subscribe(data => {
      this.styles = data;
    });
  }

  onSubmit() {
    if (this.styleForm.valid) {
      const formValue = this.styleForm.value;
      
      // Creating a new Style object mapping BOM Style fields to the core Style model
      const styleData: Style = {
        styleCode: formValue.styleCode,
        styleName: formValue.description || formValue.styleCode, // using description as name fallback
        styleType: formValue.styleType,
        description: formValue.description,
        buyerId: '',
        season: '',
        garmentType: formValue.styleType,
        gender: 'Unisex',
        approvalStatus: 'Draft',
        sizeSet: ['S', 'M', 'L', 'XL']
      };

      this.styleService.createStyle(styleData).subscribe(() => {
        this.notify.success('BOM Style added successfully');
        this.styleForm.reset({ styleType: 'Casual' });
        this.loadStyles();
      });
    }
  }

  deleteStyle(id: string) {
    if (confirm('Are you sure you want to delete this BOM style?')) {
      this.styleService.deleteStyle(id).subscribe(() => {
        this.notify.success('BOM Style deleted');
        this.loadStyles();
      });
    }
  }
}
