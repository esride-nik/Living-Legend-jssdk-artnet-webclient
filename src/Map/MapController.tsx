import Point from "@arcgis/core/geometry/Point";
import Map from "@arcgis/core/Map";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import * as React from "react";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

// import { reaction } from "mobx";
import { Stores } from "../Stores/Stores";
import { Config } from "Config/types/config";

export default class MapController {
  private stores!: Stores;
  private config!: Config;

  // setStores needs to be called with a valid object before the rest of the class works
  setStores = (stores: Stores): void => {
    this.stores = stores;
    this.config = stores.appStore.config;
  };

  private readonly graphicsLayer: GraphicsLayer = new GraphicsLayer({
    listMode: "hide",
  });

  public map!: Map;
  public mapView!: MapView;

  mapNode = React.createRef<HTMLDivElement>();

  initMap = (): void => {
    console.debug("init Map", this);
    if (!this.stores)
      throw new Error(
        `setStores() needs to be called with a valid object before the rest of the MapController works.`
      );

    if (this.config.webMapItemId.length > 0) {
      this.map = new WebMap({
        portalItem: {
          id: this.config.webMapItemId,
        },
      });
      this.mapView = new MapView({
        map: this.map,
        container: this.mapNode.current ?? undefined,
        ui: { components: [] },
      });
    } else {
      this.map = new Map({
        basemap: this.config.basemap,
      });
      this.mapView = new MapView({
        map: this.map,
        container: this.mapNode.current ?? undefined,
        center: this.config.initialMapCenter,
        zoom: this.config.initialMapZoom,
        ui: { components: [] },
      });
    }

    this.mapView.when((v: MapView) => {
      this.stores.mapStore.setMapView(v);
      v.watch("center", (center: Point) => {
        this.stores.mapStore.setCenter(center);
      });
      v.map.add(this.graphicsLayer);
    });

    // reaction(
    //   () => this.mapStore.layers,
    //   () => {
    //     this.initLayers();
    //   }
    // );
  };

  public readonly getGraphicsLayer = (): GraphicsLayer => {
    return this.graphicsLayer;
  };
}
