import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-choix-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './choix-register.page.html',
  styleUrls: ['./choix-register.page.scss'],
})
export class ChoixRegisterPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
