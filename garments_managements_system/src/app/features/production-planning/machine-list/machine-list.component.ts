import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-machine-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Add Machine Form -->
        <div class="col-md-4">
          <div class="card shadow-sm border-0">
            <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
              <h6 class="mb-0 text-white"><i class="bi bi-cpu me-2"></i>Add Machine</h6>
            </div>
            <div class="card-body">
              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Machine ID</label>
                  <input class="form-control" formControlName="machineId" placeholder="e.g. MAC-01">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Machine Name</label>
                  <input class="form-control" formControlName="machineName" placeholder="e.g. Overlock Sewing Machine">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Type</label>
                  <input class="form-control" formControlName="type" placeholder="e.g. Overlock / Lockstitch / Buttonhole">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Line</label>
                  <select class="form-select" formControlName="line">
                    <option value="">Select Line</option>
                    <option *ngFor="let l of lines" [value]="l.lineName">{{ l.lineName }} ({{ l.lineId }})</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary w-100" [disabled]="form.invalid">Add Machine</button>
              </form>
            </div>
          </div>
        </div>

        <!-- Machines List -->
        <div class="col-md-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-0 py-3">
              <h6 class="mb-0 text-primary fw-bold">Machine Directory</h6>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0 align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Machine ID</th>
                      <th>Machine Name</th>
                      <th>Type</th>
                      <th>Assigned Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let m of machines">
                      <td class="fw-bold text-primary">{{ m.machineId }}</td>
                      <td>{{ m.machineName }}</td>
                      <td><span class="badge bg-light text-dark border">{{ m.type }}</span></td>
                      <td><span class="badge bg-info text-dark">{{ m.line }}</span></td>
                    </tr>
                    <tr *ngIf="machines.length === 0">
                      <td colspan="4" class="text-center py-4 text-muted">No machines registered yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MachineListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  machines: any[] = [];
  lines: any[] = [];

  form: FormGroup = this.fb.group({
    machineId: ['', Validators.required],
    machineName: ['', Validators.required],
    type: ['', Validators.required],
    line: ['', Validators.required]
  });

  ngOnInit() {
    this.loadMachines();
    this.loadLines();
  }

  loadMachines() {
    this.svc.getMachines().subscribe(data => this.machines = data);
  }

  loadLines() {
    this.svc.getLines().subscribe(data => this.lines = data);
  }

  onSubmit() {
    if (this.form.valid) {
      this.svc.createMachine(this.form.value).subscribe(() => {
        this.notify.success('Machine added successfully');
        this.form.reset({ line: '' });
        this.loadMachines();
      });
    }
  }
}
