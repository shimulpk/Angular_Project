import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from './loading-service/loading-service';
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css'})
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}
