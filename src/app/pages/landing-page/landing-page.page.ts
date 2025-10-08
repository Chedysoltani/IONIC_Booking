import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from "@ionic/angular";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  templateUrl: './landing-page.page.html',
  styleUrls: ['./landing-page.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class LandingPage {

  constructor(private router: Router) {}

  navigateToRegister() {
    this.router.navigateByUrl('/register');
  }

  navigateToExperts() {
    this.router.navigateByUrl('/experts');
  }

  navigateToLogin() {
    this.router.navigateByUrl('/login');
  }
}