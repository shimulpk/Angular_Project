import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-feature-placeholder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-placeholder.component.html',
  styleUrl: './feature-placeholder.component.css'})
export class FeaturePlaceholderComponent {
  @Input() title: string = 'Feature Module';
  @Input() icon: string = 'bi-gear';
}
