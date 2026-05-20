import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StyleService } from '../style-service/style.service';
import { Style } from '../../../models/style/style.model';
@Component({
  selector: 'app-style-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './style-details.component.html',
  styleUrl: './style-details.component.css'})
export class StyleDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private styleService = inject(StyleService);

  style: Style | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.styleService.getStyleById(id).subscribe(data => this.style = data);
    }
  }
}
