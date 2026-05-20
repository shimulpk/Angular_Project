import { Component, inject, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Buyer, BuyerContact } from '../../../models/buyer/buyer.model';
import { ReusableTableComponent, TableColumn } from '../../../shared/components/reusable-table/reusable-table.component';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { BuyerService } from '../buyer-service/buyer.service';
@Component({
  selector: 'app-buyer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buyer-list.component.html',
  styleUrl: './buyer-list.component.css'})
export class BuyerFormComponent implements OnInit {
  @Input() buyer: Buyer | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private buyerService = inject(BuyerService);
  private notify = inject(NotificationService);

  buyerForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    if (this.buyer) this.patchForm();
    else this.addContact();
  }

  initForm() {
    this.buyerForm = this.fb.group({
      buyerCode: ['', Validators.required],
      companyName: ['', Validators.required],
      country: ['', Validators.required],
      currency: ['USD'],
      paymentTerms: [''],
      status: ['Active'],
      contacts: this.fb.array([])
    });
  }

  get contacts() { return this.buyerForm.get('contacts') as FormArray; }

  addContact(contact?: BuyerContact) {
    const contactForm = this.fb.group({
      name: [contact?.name || '', Validators.required],
      email: [contact?.email || ''],
      phone: [contact?.phone || ''],
      designation: [contact?.designation || '']
    });
    this.contacts.push(contactForm);
  }

  removeContact(index: number) { this.contacts.removeAt(index); }

  patchForm() {
    this.buyerForm.patchValue({
      buyerCode: this.buyer?.buyerCode,
      companyName: this.buyer?.companyName,
      country: this.buyer?.country,
      currency: this.buyer?.currency,
      paymentTerms: this.buyer?.paymentTerms,
      status: this.buyer?.status
    });
    this.buyer?.contacts.forEach(c => this.addContact(c));
  }

  save() {
    if (this.buyerForm.valid) {
      const buyerData = this.buyerForm.value;
      const obs = this.buyer ? this.buyerService.updateBuyer(this.buyer.id!, buyerData) : this.buyerService.createBuyer(buyerData);
      obs.subscribe(() => {
        this.notify.success(this.buyer ? 'Buyer updated' : 'Buyer created');
        this.onSave.emit();
      });
    }
  }
}

@Component({
  selector: 'app-buyer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReusableTableComponent, BuyerFormComponent],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold">Buyer Management</h3>
          <p class="text-muted">Manage company buyers and contact information</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="bi bi-plus-lg me-2"></i> Add New Buyer
        </button>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control border-start-0" placeholder="Search..." [(ngModel)]="searchTerm" (input)="onSearch()">
              </div>
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="statusFilter" (change)="onSearch()">
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <app-reusable-table
          [columns]="columns"
          [data]="filteredBuyers"
          (onView)="viewBuyer($event)"
          (onEdit)="editBuyer($event)"
          (onDelete)="deleteBuyer($event)">
        </app-reusable-table>
      </div>
    </div>

    <app-buyer-form 
      *ngIf="showModal" 
      [buyer]="selectedBuyer" 
      (onClose)="closeModal()" 
      (onSave)="onBuyerSaved()">
    </app-buyer-form>
  `
})
export class BuyerListComponent implements OnInit {
  private buyerService = inject(BuyerService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  buyers: Buyer[] = [];
  filteredBuyers: Buyer[] = [];
  searchTerm = '';
  statusFilter = '';
  showModal = false;
  selectedBuyer: Buyer | null = null;

  columns: TableColumn[] = [
    { key: 'buyerCode', label: 'Code' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'country', label: 'Country' },
    { key: 'status', label: 'Status', type: 'badge', badgeClass: (val: any) => val === 'Active' ? 'bg-success' : 'bg-secondary' }
  ];

  ngOnInit() { this.loadBuyers(); }

  loadBuyers() {
    this.buyerService.getBuyers().subscribe(data => {
      this.buyers = data;
      this.onSearch();
    });
  }

  onSearch() {
    this.filteredBuyers = this.buyers.filter(b => {
      const matchSearch = b.companyName.toLowerCase().includes(this.searchTerm.toLowerCase()) || b.buyerCode.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = this.statusFilter === '' || b.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  openAddModal() { this.selectedBuyer = null; this.showModal = true; }
  editBuyer(buyer: Buyer) { this.selectedBuyer = buyer; this.showModal = true; }
  viewBuyer(buyer: Buyer) { this.router.navigate(['/buyers', buyer.id]); }

  deleteBuyer(buyer: Buyer) {
    if (confirm(`Delete ${buyer.companyName}?`)) {
      this.buyerService.deleteBuyer(buyer.id!).subscribe(() => {
        this.notify.success('Buyer deleted');
        this.loadBuyers();
      });
    }
  }

  closeModal() { this.showModal = false; this.selectedBuyer = null; }
  onBuyerSaved() { this.loadBuyers(); this.closeModal(); }
}
