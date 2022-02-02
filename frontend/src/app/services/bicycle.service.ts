import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
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

  getBicycles(): Observable<any> {
    if (!navigator.onLine) {
      return from(this.storageService.get("bicycles"));
    }
    return this.httpClient.get(this.endpoint).pipe(
      tap(async bicycles => {
        await this.storageService.set("bicycles", { type: "storage", bicycles });
      }),
      catchError(this.handleError('Get bicycle'))
    );
  }

  async sync() {
    let bicycles = await this.storageService.get("bicycles");
    let observables = [];
    bicycles.bicycles.map(b => {
      if (b.updated) {
        observables.push(this.update(b));
      }
    });
    if (observables.length >= 1) {
      return forkJoin(observables).pipe(mergeMap((o) => {
        return of(observables.length.toString());
      }));
    }
    return of("no updates");
  }

  update(bicycle: Bicycle): Observable<any> {
    if (!navigator.onLine) {
      return from(this.changeBicycleInStorage(bicycle, true));
    }
    return this.httpClient.put(this.endpoint + "/" + bicycle.id, bicycle, this.httpOptions).pipe(
      tap(async result => {
        await this.changeBicycleInStorage(bicycle, false);
      }),
      catchError(this.handleError('Update bicycle', bicycle))
    );
  }

  private async changeBicycleInStorage(bicycle: Bicycle, updated: boolean) {
    let bicycles = await this.storageService.get("bicycles");
    bicycles.bicycles.map(b => {
      if (b.id == bicycle.id) {
        b.stock = bicycle.stock;
        b.updated = updated;
      }
    });
    await this.storageService.set("bicycles", bicycles);
  }

  private handleError(operation = 'operation', bicycle?: Bicycle) {
    return (error: any) => {
      if (operation == "Update bicycle") {
        return from(this.changeBicycleInStorage(bicycle, true));
      }
      return from(this.storageService.get("bicycles"));
    };
  }
}




