import { action, makeObservable, observable } from "mobx";
import AppStore from "../Stores/AppStore";
import { LedNumsAndColors } from "./ArtnetCmp";

class ArtnetStore {
  private readonly appStore: AppStore;
  rValue: number = 0;
  gValue: number = 100;
  bValue: number = 200;
  ledNumsAndColors: LedNumsAndColors[] = [];

  constructor(appStore: AppStore) {
    this.appStore = appStore;
    makeObservable(this, {
      rValue: observable,
      gValue: observable,
      bValue: observable,
      ledNumsAndColors: observable,
    });
  }

  set rVal(r: number) {
    this.rValue = r;
  }

  set gVal(g: number) {
    this.gValue = g;
  }

  set bVal(b: number) {
    this.bValue = b;
  }
}

export default ArtnetStore;
