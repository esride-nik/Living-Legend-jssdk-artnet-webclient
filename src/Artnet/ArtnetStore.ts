import MapStore from "Map/MapStore";
import { action, makeObservable, observable, when } from "mobx";
import AppStore from "../Stores/AppStore";
import { LedNumsAndColors } from "./ArtnetCmp";
import * as arcade from "@arcgis/core/arcade.js";

class ArtnetStore {
  private readonly appStore: AppStore;
  private readonly mapStore: MapStore;
  ledNumsAndColors: LedNumsAndColors[] = [];
  statsQuery: __esri.Query | undefined;
  flv: __esri.FeatureLayerView | undefined;
  uniqueValueExpressionArcadeExecutor: __esri.ArcadeExecutor | undefined;

  constructor(appStore: AppStore, mapStore: MapStore) {
    this.appStore = appStore;
    this.mapStore = mapStore;
    makeObservable(this, {
      ledNumsAndColors: observable,
      setLedNumsAndColors: action,
      pushLedNumsAndColors: action,
    });

    when(
      () => this.mapStore.mapView !== undefined,
      () => {
        this.waitForLayerViews();
      }
    );
  }

  setLedNumsAndColors(l: LedNumsAndColors[]) {
    this.ledNumsAndColors = l;
  }

  pushLedNumsAndColors(l: LedNumsAndColors) {
    this.ledNumsAndColors.push(l);
  }

  private waitForLayerViews = async (): Promise<void> => {
    const allWhens = this.mapStore.mapView?.map.allLayers
      .map((l: __esri.Layer) => this.mapStore.mapView?.whenLayerView(l))
      .toArray();
    await Promise.all(allWhens!);
    console.log("all layer views loaded");
    await this.initArtnetValues();
    await this.initArcadeExpression();
  };

  private initArtnetValues = async (): Promise<void> => {
    const flvs = this.mapStore.mapView!.layerViews.filter(
      (lv: __esri.LayerView) =>
        lv.layer.id ===
        "Mexico_demographics_9019_2472_1207_1266_5291_8139_3705_8933_6649_5451"
    );
    this.flv = flvs?.getItemAt(0) as __esri.FeatureLayerView;

    const educationFields = [
      "EDUC01_CY",
      "EDUC02_CY",
      "EDUC03_CY",
      "EDUC04_CY",
      "EDUC05_CY",
      "EDUC06_CY",
      "EDUC07_CY",
      "EDUC08_CY",
      "EDUC09_CY",
      "EDUC10_CY",
      "EDUC11_CY",
      "EDUC12_CY",
      "EDUC13_CY",
      "EDUC14_CY",
      "EDUC15_CY",
      "EDUC16_CY",
      "EDUCA_BASE",
    ];

    // Creates a query object for statistics of each of the fields listed above
    const statDefinitions = educationFields.map(function (fieldName) {
      return {
        onStatisticField: fieldName,
        outStatisticFieldName: fieldName + "_TOTAL",
        statisticType: "sum",
      };
    });

    // query statistics for features only in view extent
    this.statsQuery = this.flv.layer.createQuery();
    this.statsQuery.outStatistics =
      statDefinitions as __esri.StatisticDefinition[];
    this.statsQuery.outFields = ["*"];
    this.statsQuery.geometry = this.mapStore.mapView!.extent;
  };

  private async initArcadeExpression() {
    // Arcade Executor Definition
    const renderer = this.flv!.layer.renderer;
    const valueExpression = (renderer as __esri.UniqueValueRenderer)
      .valueExpression;

    const visualizationProfile = {
      variables: [
        {
          name: "$feature",
          type: "feature",
        },
        {
          name: "$view",
          type: "dictionary",
          properties: [
            {
              name: "scale",
              type: "number",
            },
          ],
        },
      ],
    } as __esri.Profile;

    this.uniqueValueExpressionArcadeExecutor =
      await arcade.createArcadeExecutor(valueExpression, visualizationProfile);
  }
}

export default ArtnetStore;
