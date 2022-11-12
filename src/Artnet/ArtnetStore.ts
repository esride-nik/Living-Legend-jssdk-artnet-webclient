import { makeObservable, observable } from "mobx";
import AppStore from "../Stores/AppStore";

class ArtnetStore {
  private readonly appStore: AppStore;
  statusMessage: string = "";
  changeCounter: number = 0;

  constructor(appStore: AppStore) {
    this.appStore = appStore;
    makeObservable(this, {
      statusMessage: observable,
      changeCounter: observable,
    });
  }
}

export default ArtnetStore;
