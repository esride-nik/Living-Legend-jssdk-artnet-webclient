import { Config, WidgetName } from "Config/types/config";
import getEditEsriElement from "../Editing/EditEsriElement";
import MapStore from "./MapStore";

const getMapModuleEsriElement = (
  module: WidgetName,
  config: Config,
  mapStore: MapStore
): __esri.Widget | HTMLElement | null => {
  switch (module) {
    case "edit": {
      return getEditEsriElement(config, mapStore);
    }
    default: {
      return null;
    }
  }
};

export default getMapModuleEsriElement;
