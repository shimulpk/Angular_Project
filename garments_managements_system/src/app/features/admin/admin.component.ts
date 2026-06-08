import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api/api.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { User } from '../../models/user/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  activeTab: 'users' | 'lines' | 'materials' | 'security' = 'users';

  // Users Data
  users: User[] = [];
  currentUser: User = this.getEmptyUser();
  isEditingUser = false;
  showUserModal = false;

  // Production Lines Data
  productionLines: any[] = [];
  currentLine: any = { id: '', name: '', capacity: 1000 };
  isEditingLine = false;
  showLineModal = false;

  // Warehouse/Suppliers Data
  suppliers: string[] = ['TextileMills', 'ThreadCo', 'Tanvir', 'EuroButton', 'YKK Corp'];
  categories: string[] = ['Fabric', 'Trims', 'Accessories', 'Packaging'];
  newSupplier = '';
  newCategory = '';

  // Mock Audit Logs
  auditLogs = [
    { id: 1, action: 'USER_ROLE_CHANGE', user: 'admin', details: 'Assigned MERCHANDISER role to Alex Merch', time: '2026-05-18 00:45' },
    { id: 2, action: 'STOCK_ADJUSTMENT', user: 'store', details: 'Adjusted Cotton Jersey 160 GSM by +500kg', time: '2026-05-18 00:15' },
    { id: 3, action: 'LINE_ADDED', user: 'admin', details: 'Configured new production Line 03 (capacity: 1000)', time: '2026-05-17 19:30' },
    { id: 4, action: 'SAMPLE_APPROVED', user: 'merch', details: 'Approved tech pack sample for basic tee ZARA-01', time: '2026-05-17 18:20' },
    { id: 5, action: 'SECURITY_SETTING_CHANGED', user: 'admin', details: 'Updated token expiry time limit to 4 hours', time: '2026-05-17 15:10' }
  ];

  // Security configuration values
  securitySettings = {
    tokenExpiry: 4,
    minPasswordLength: 8,
    requireTwoFactor: false,
    restrictIPs: false
  };

  ngOnInit() {
    this.loadUsers();
    this.loadProductionLines();
  }

  // ---------------------------------------------
  // Data Loaders
  // ---------------------------------------------
  loadUsers() {
    this.api.getAll<User>('users').subscribe({
      next: (data) => this.users = data,
      error: (err) => this.notify.error('Failed to load users: ' + err.message)
    });
  }

  loadProductionLines() {
    this.api.getAll<any>('productionLines').subscribe({
      next: (data) => this.productionLines = data,
      error: (err) => this.notify.error('Failed to load production lines: ' + err.message)
    });
  }

  // ---------------------------------------------
  // User Management Methods
  // ---------------------------------------------
  getEmptyUser(): User {
    return {
      username: '',
      password: '',
      fullName: '',
      role: 'MERCHANDISER',
      email: ''
    };
  }

  openAddUser() {
    this.currentUser = this.getEmptyUser();
    this.isEditingUser = false;
    this.showUserModal = true;
  }

  openEditUser(user: User) {
    this.currentUser = { ...user };
    this.isEditingUser = true;
    this.showUserModal = true;
  }

  closeUserModal() {
    this.showUserModal = false;
  }

  saveUser() {
    if (!this.currentUser.username || !this.currentUser.fullName || !this.currentUser.email || !this.currentUser.role) {
      this.notify.error('Please fill in all required fields.');
      return;
    }

    if (this.isEditingUser && this.currentUser.id) {
      this.api.update<User>('users', this.currentUser.id, this.currentUser).subscribe({
        next: () => {
          this.notify.success('User updated successfully.');
          this.loadUsers();
          this.closeUserModal();
          this.logAction('USER_UPDATED', `Updated user: ${this.currentUser.username} (${this.currentUser.role})`);
        },
        error: (err) => this.notify.error('Failed to update user: ' + err.message)
      });
    } else {
      if (!this.currentUser.password) {
        this.currentUser.password = 'password123'; // default password
      }
      this.api.create<User>('users', this.currentUser).subscribe({
        next: () => {
          this.notify.success('User created successfully.');
          this.loadUsers();
          this.closeUserModal();
          this.logAction('USER_CREATED', `Created new user: ${this.currentUser.username} (${this.currentUser.role})`);
        },
        error: (err) => this.notify.error('Failed to create user: ' + err.message)
      });
    }
  }

  deleteUser(id?: string) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this user?')) {
      const user = this.users.find(u => u.id === id);
      this.api.delete('users', id).subscribe({
        next: () => {
          this.notify.success('User deleted successfully.');
          this.loadUsers();
          if (user) {
            this.logAction('USER_DELETED', `Deleted user: ${user.username}`);
          }
        },
        error: (err) => this.notify.error('Failed to delete user: ' + err.message)
      });
    }
  }

  // ---------------------------------------------
  // Production Line Methods
  // ---------------------------------------------
  openAddLine() {
    this.currentLine = { id: '', name: '', capacity: 1000 };
    this.isEditingLine = false;
    this.showLineModal = true;
  }

  openEditLine(line: any) {
    this.currentLine = { ...line };
    this.isEditingLine = true;
    this.showLineModal = true;
  }

  closeLineModal() {
    this.showLineModal = false;
  }

  saveProductionLine() {
    if (!this.currentLine.id || !this.currentLine.name || !this.currentLine.capacity) {
      this.notify.error('Please fill in all fields.');
      return;
    }

    if (this.isEditingLine) {
      this.api.update<any>('productionLines', this.currentLine.id, this.currentLine).subscribe({
        next: () => {
          this.notify.success('Production line updated.');
          this.loadProductionLines();
          this.closeLineModal();
          this.logAction('LINE_UPDATED', `Updated line capacity: ${this.currentLine.name} (${this.currentLine.capacity})`);
        },
        error: (err) => this.notify.error('Failed to update line: ' + err.message)
      });
    } else {
      this.api.create<any>('productionLines', this.currentLine).subscribe({
        next: () => {
          this.notify.success('Production line configured successfully.');
          this.loadProductionLines();
          this.closeLineModal();
          this.logAction('LINE_CREATED', `Configured production line: ${this.currentLine.name} (${this.currentLine.capacity})`);
        },
        error: (err) => this.notify.error('Failed to configure line: ' + err.message)
      });
    }
  }

  deleteProductionLine(id: string) {
    if (confirm('Are you sure you want to delete this production line?')) {
      this.api.delete('productionLines', id).subscribe({
        next: () => {
          this.notify.success('Production line removed.');
          this.loadProductionLines();
          this.logAction('LINE_DELETED', `Deleted production line: ${id}`);
        },
        error: (err) => this.notify.error('Failed to delete line: ' + err.message)
      });
    }
  }

  // ---------------------------------------------
  // Warehouse & Supplier Configuration Methods
  // ---------------------------------------------
  addSupplier() {
    if (!this.newSupplier.trim()) return;
    this.suppliers.push(this.newSupplier.trim());
    this.notify.success(`Supplier "${this.newSupplier}" added.`);
    this.logAction('SUPPLIER_ADDED', `Configured supplier: ${this.newSupplier}`);
    this.newSupplier = '';
  }

  removeSupplier(index: number) {
    const sName = this.suppliers[index];
    this.suppliers.splice(index, 1);
    this.notify.success(`Supplier "${sName}" removed.`);
    this.logAction('SUPPLIER_REMOVED', `Removed supplier: ${sName}`);
  }

  addCategory() {
    if (!this.newCategory.trim()) return;
    this.categories.push(this.newCategory.trim());
    this.notify.success(`Raw material category "${this.newCategory}" added.`);
    this.logAction('CATEGORY_ADDED', `Configured category: ${this.newCategory}`);
    this.newCategory = '';
  }

  removeCategory(index: number) {
    const cName = this.categories[index];
    this.categories.splice(index, 1);
    this.notify.success(`Category "${cName}" removed.`);
    this.logAction('CATEGORY_REMOVED', `Removed raw material category: ${cName}`);
  }

  // ---------------------------------------------
  // Security Configurations & Logs
  // ---------------------------------------------
  saveSecuritySettings() {
    this.notify.success('Security configurations applied successfully.');
    this.logAction('SECURITY_SETTING_CHANGED', `Token expiry: ${this.securitySettings.tokenExpiry}hr, Req2FA: ${this.securitySettings.requireTwoFactor}`);
  }

  logAction(action: string, details: string) {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.auditLogs.unshift({
      id: this.auditLogs.length + 1,
      action,
      user: 'admin',
      details,
      time: nowStr
    });
  }
}
