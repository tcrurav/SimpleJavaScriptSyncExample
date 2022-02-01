import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Bicycle from '../models/bicycle';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class BicycleService {

  endpoint = 'http://192.168.0.21:4000/api/bicycle';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient, private storageService: StorageService) { }

  getBicycles() {
    if (!navigator.onLine) {
      console.log("No connection to API!")
      return from(this.storageService.get("bicycles"));
    }
    console.log("API reachable!")
    return this.httpClient.get(this.endpoint).pipe(
      tap(async bicycles => {
        await this.storageService.set("bicycles", { type: "storage", bicycles });
      }),
      catchError(this.handleError('Get bicycle'))
    );
  }

  async sync() {
    let bicycles = await this.storageService.get("bicycles");
    let observables = new Array<Observable<any>>();
    bicycles.bicycles.map(b => {
      if (b.updated) {
        console.log("sync")
        console.log(b)
        // observables.push(this.update(b));
        this.update(b).subscribe(() => console.log("done the update"));
      }
    });
    console.log("antes del final del sync")
    // console.log(observables.length);

  }

  update(bicycle: Bicycle) {
    if (!navigator.onLine) {
      console.log("No connection to API!");
      return from(this.changeBicycleInStorage(bicycle, true));
    }
    console.log("API reachable!")
    return this.httpClient.put(this.endpoint + "/" + bicycle.id, bicycle, this.httpOptions).pipe(
      tap(async result => {
        await this.changeBicycleInStorage(bicycle, false);
      }),
      catchError(this.handleError('Update bicycle', bicycle))
    );
  }

  private async changeBicycleInStorage(bicycle: Bicycle, updated: boolean) {
    console.log("changeBicycleInStorage")
    console.log(bicycle)
    console.log(updated)
    let bicycles = await this.storageService.get("bicycles");
    console.log("after reading localstorage")
    console.log(bicycles)
    bicycles.bicycles.map(b => {
      if (b.id == bicycle.id) {
        b.stock = bicycle.stock;
        b.updated = updated;
        console.log("coincide")
        console.log(b);
      }
    });
    console.log("volver a escribir")
    console.log(bicycles)
    await this.storageService.set("bicycles", bicycles);
  }

  private handleError(operation = 'operation', bicycle?: Bicycle) {
    return (error: any) => {
      // console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      if (operation == "Update bicycle") {
        return from(this.changeBicycleInStorage(bicycle, true));
      }
      //operation = "Get bicycle"
      return from(this.storageService.get("bicycles"));
    };
  }
}




