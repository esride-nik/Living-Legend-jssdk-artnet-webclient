import { makeObservable } from "mobx";
import AppStore from "./AppStore";
import MapStore from "../Map/MapStore";
import StatusStore from "../Status/StatusStore";
import { Config } from "../Config/types/config";
import EditStore from "Editing/EditStore";
import ArtnetStore from "Artnet/ArtnetStore";

export interface IStores {
  appStore: AppStore;
  mapStore: MapStore;
  editStore: EditStore;
  statusStore: StatusStore;
  artnetStore: ArtnetStore;
}

export class Stores implements IStores {
  appStore: AppStore;
  mapStore: MapStore;
  editStore: EditStore;
  statusStore: StatusStore;
  artnetStore: ArtnetStore;

  static instance: IStores;

  // Singleton pattern: getInstance and private constructor
  static getInstance(config: Config): IStores {
    if (Stores.instance === undefined) {
      Stores.instance = new Stores(config);
    }
    return Stores.instance;
  }

  constructor(config: Config) {
    makeObservable(this, {});

    // initialize all stores in correct order
    this.appStore = new AppStore(config);
    this.mapStore = new MapStore(this.appStore);
    this.editStore = new EditStore(this.appStore);
    this.statusStore = new StatusStore(this.appStore);
    this.artnetStore = new ArtnetStore(this.appStore, this.mapStore);
  }
}
