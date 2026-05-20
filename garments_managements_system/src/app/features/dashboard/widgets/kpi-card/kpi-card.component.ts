import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.css'})
export class KpiCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = '';
  @Input() color: string = 'primary';
  @Input() trendValue: number = 0;
  @Input() trendText: string = '';
}
