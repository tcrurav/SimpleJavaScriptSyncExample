import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import Bicycle from '../models/bicycle';
import { BicycleService } from '../services/bicycle.service';
import { ConnectivityService } from '../services/connectivity.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  bicycles: Array<Bicycle> = [];

  constructor(
    private bicycleService: BicycleService,
    public toastController: ToastController,
    private connectivityService: ConnectivityService) { }

  ionViewDidEnter() {
    this.getBicycles();

    this.connectivityService.appIsOnline$.subscribe(online => {
      if (online) {
        // call functions or methods that need to execute when app goes online (such as sync() etc)
        this.bicycleService.sync();
      } else {
        // call functions on network offline, such as firebase.goOffline()
      }
    })

  }

  getBicycles() {
    this.bicycleService.sync().then((o) => {
      o.subscribe((algo) => {
        this.bicycleService.getBicycles().subscribe(async (response) => {
          if (!response) {
            this.bicycles = [];
            await this.presentToast('No bicycles to show!');
            return;
          }
          if (response?.type) {
            this.bicycles = response.bicycles;
            await this.presentToast('Working offline!');
            return;
          }
          this.bicycles = response;
        });
      });
    });
  }

  update(b: Bicycle, inc: number) {
    b.stock += inc;
    this.bicycleService.sync().then((o) => {
      o.subscribe((algo) => {
        this.bicycleService.update(b).subscribe(async (response) => {
          this.getBicycles();
        });
      })
    })
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'middle'
    });
    toast.present();
  }

}
