import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login-admin.page.html',
  styleUrls: ['./login-admin.page.scss'],
})
export class LoginAdminPage implements OnInit {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router, private toastCtrl: ToastController) { }

  ngOnInit() {
  }

  async onSubmit() {
    this.errorMessage = '';
    if (this.username === 'admin' && this.password === 'root') {
      await this.router.navigateByUrl('/admin-dashboard');
      return;
    }
    this.errorMessage = 'Identifiants invalides';
    const toast = await this.toastCtrl.create({
      message: this.errorMessage,
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }

}
