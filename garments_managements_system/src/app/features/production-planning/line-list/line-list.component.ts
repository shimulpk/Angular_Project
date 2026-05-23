import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-line-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card shadow-sm border-0">
            <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
              <h6 class="mb-0 text-white"><i class="bi bi-diagram-3 me-2"></i>Add Production Line</h6>
            </div>
            <div class="card-body">
              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Line ID</label>
                  <input class="form-control" formControlName="lineId" placeholder="e.g. L1">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Line Name</label>
                  <input class="form-control" formControlName="lineName" placeholder="e.g. Line 01">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Supervisor</label>
                  <input class="form-control" formControlName="supervisor" placeholder="Supervisor name">
                </div>
                <button type="submit" class="btn btn-primary w-100" [disabled]="form.invalid">Add Line</button>
              </form>
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-0 py-3">
              <h6 class="mb-0 text-primary">Production Lines</h6>
            </div>
            <div class="card-body p-0">
              <table class="table table-hover mb-0 align-middle">
                <thead class="table-light">
                  <tr><th>Line ID</th><th>Line Name</th><th>Supervisor</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let l of lines">
                    <td class="fw-bold text-primary">{{ l.lineId }}</td>
                    <td>{{ l.lineName }}</td>
                    <td>{{ l.supervisor }}</td>
                  </tr>
                  <tr *ngIf="lines.length === 0">
                    <td colspan="3" class="text-center py-4 text-muted">No lines added yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LineListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  lines: any[] = [];
  form: FormGroup = this.fb.group({
    lineId: ['', Validators.required],
    lineName: ['', Validators.required],
    supervisor: ['', Validators.required]
  });

  ngOnInit() { this.load(); }
  load() { this.svc.getLines().subscribe(d => this.lines = d); }

  onSubmit() {
    if (this.form.valid) {
      this.svc.createLine(this.form.value).subscribe(() => {
        this.notify.success('Line added');
        this.form.reset();
        this.load();
      });
    }
  }
}
