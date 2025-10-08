import { Component, OnInit } from '@angular/core';
import { IonicModule } from "@ionic/angular";

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss'],
  imports: [IonicModule],
})
export class UserDashboardPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
