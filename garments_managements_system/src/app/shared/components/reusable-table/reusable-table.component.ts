import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'action';
  badgeClass?: (value: any) => string;
}

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reusable-table.component.html',
  styleUrl: './reusable-table.component.css'})
export class ReusableTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showActions: boolean = true;

  @Output() onView = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
}
