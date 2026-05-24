import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StyleService } from '../../../core/services/style.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { Style } from '../../../models/style/style.model';

@Component({
  selector: 'app-add-bom-style',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-bom-style.component.html'
})
export class AddBomStyleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private styleService = inject(StyleService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  styleForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.styleForm = this.fb.group({
      styleCode: ['', Validators.required],
      styleType: ['Casual', Validators.required],
      description: ['']
    });
  }

  onSubmit() {
    if (this.styleForm.valid) {
      const formValue = this.styleForm.value;
      const styleData: Style = {
        styleCode: formValue.styleCode,
        styleName: formValue.description || formValue.styleCode,
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
        this.router.navigate(['/bom-style/list']);
      });
    }
  }
}
