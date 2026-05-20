import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BuyerService } from '../buyer-service/buyer.service';
import { Buyer } from '../../../models/buyer/buyer.model';
@Component({
  selector: 'app-buyer-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buyer-details.component.html',
  styleUrl: './buyer-details.component.css'})
export class BuyerDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private buyerService = inject(BuyerService);

  buyer: Buyer | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.buyerService.getBuyerById(id).subscribe(data => {
        this.buyer = data;
      });
    }
  }
}
