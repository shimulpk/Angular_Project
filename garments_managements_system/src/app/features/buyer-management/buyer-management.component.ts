import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { BuyerService } from '../../core/services/buyer.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { Buyer } from '../../models/buyer/buyer.model';

@Component({
  selector: 'app-buyer-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buyer-management.component.html',
  styleUrl: './buyer-management.component.css'
})
export class BuyerManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private buyerService = inject(BuyerService);
  private notify = inject(NotificationService);

  buyerForm!: FormGroup;
  buyers: Buyer[] = [];
  editMode = false;
  editingId: string | null = null;

  ngOnInit() {
    this.initForm();
    this.loadBuyers();
  }

  initForm() {
    this.buyerForm = this.fb.group({
      buyerCode: ['', Validators.required],
      companyName: ['', Validators.required],
      country: ['', Validators.required],
      address: [''],
      website: [''],
      currency: ['USD'],
      paymentTerms: [''],
      status: ['Active'],
      contacts: this.fb.array([])
    });
    this.addContact();
  }

  get contacts() {
    return this.buyerForm.get('contacts') as FormArray;
  }

  addContact() {
    this.contacts.push(this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      email: [''],
      designation: ['Contact Person']
    }));
  }

  loadBuyers() {
    this.buyerService.getBuyers().subscribe(data => {
      this.buyers = data;
    });
  }

  onSubmit() {
    if (this.buyerForm.valid) {
      const formValue = this.buyerForm.value;
      if (this.editMode && this.editingId) {
        this.buyerService.updateBuyer(this.editingId, formValue).subscribe(() => {
          this.notify.success('Buyer updated successfully');
          this.resetForm();
          this.loadBuyers();
        });
      } else {
        this.buyerService.createBuyer(formValue).subscribe(() => {
          this.notify.success('Buyer added successfully');
          this.resetForm();
          this.loadBuyers();
        });
      }
    }
  }

  editBuyer(buyer: Buyer) {
    this.editMode = true;
    this.editingId = buyer.id!;
    
    // Clear contacts array
    while (this.contacts.length !== 0) {
      this.contacts.removeAt(0);
    }

    // Add contacts from buyer
    if (buyer.contacts && buyer.contacts.length > 0) {
      buyer.contacts.forEach(c => {
        this.contacts.push(this.fb.group({
          name: [c.name, Validators.required],
          phone: [c.phone],
          email: [c.email],
          designation: [c.designation]
        }));
      });
    } else {
      this.addContact();
    }

    this.buyerForm.patchValue({
      buyerCode: buyer.buyerCode,
      companyName: buyer.companyName,
      country: buyer.country,
      address: buyer.address || '',
      website: buyer.website || '',
      currency: buyer.currency,
      paymentTerms: buyer.paymentTerms,
      status: buyer.status
    });
  }

  deleteBuyer(id: string) {
    if (confirm('Are you sure you want to delete this buyer?')) {
      this.buyerService.deleteBuyer(id).subscribe(() => {
        this.notify.success('Buyer deleted');
        this.loadBuyers();
      });
    }
  }

  resetForm() {
    this.editMode = false;
    this.editingId = null;
    this.buyerForm.reset({
      currency: 'USD',
      status: 'Active'
    });
    while (this.contacts.length !== 0) {
      this.contacts.removeAt(0);
    }
    this.addContact();
  }
}
