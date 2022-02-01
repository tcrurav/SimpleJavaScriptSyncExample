import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import Bicycle from '../models/bicycle';
import { BicycleService } from '../services/bicycle.service';
import { ConnectivityService } from '../services/connectivity.service';
import { StorageService } from '../services/storage.service';

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
    private connectivityService: ConnectivityService,
    private storageService: StorageService) { }

  ionViewDidEnter() {
    this.getBicycles();

    this.connectivityService.appIsOnline$.subscribe(online => {

      console.log(online)

      if (online) {
        // call functions or methods that need to execute when app goes online (such as sync() etc)
        this.bicycleService.sync();
      } else {
        // call functions on network offline, such as firebase.goOffline()
      }
    })

  }

  getBicycles() {
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
  }

  update(b: Bicycle, inc: number) {
    b.stock += inc;
    this.bicycleService.update(b).subscribe(async (response) => {
      this.bicycleService.sync().then(async () => {
        let bikes = await this.storageService.get("bicycles");
        console.log("debería estar ya el dato guardado")
        console.log(bikes)
        this.getBicycles();
      });
    });
  }
  

  // listenToBeOnline() {
  //   window.addEventListener('online', () => {
  //     if (offlineService.getQueue().length) {
  //       const deferredRequests = offlineService.getQueue();

  //       deferredRequests.forEach(async payload => await APIRequest(payload));

  //       offlineService.clearQueue();
  //     }
  //   });
  // }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'middle'
    });
    toast.present();
  }

}
