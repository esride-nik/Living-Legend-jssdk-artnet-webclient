import * as React from "react";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { useStores } from "../Stores/useStores";
import "./Artnet.css";
import axios from "axios";
import ArtnetStore from "./ArtnetStore";
import MapStore from "Map/MapStore";
import FeatureLayerView from "@arcgis/core/views/layers/FeatureLayerView";
import LayerView from "@arcgis/core/views/layers/LayerView";
// import StatisticDefinition = require("esri/tasks/StatisticDefinition");

interface ArtnetCmpProps {}

function addRandomValue(org: number, mult: number) {
  const newVal = org + Math.random() * mult;
  return newVal <= 255 ? Math.round(newVal) : Math.round(newVal - 255);
}

async function sendViaAxios(ledVals: number[]) {
  const axiosProps = {
    method: "post",
    url: "http://127.0.0.1:9000",
    data: ledVals,
    headers: { "Content-Type": "application/json" },
  };
  console.log("sending via axios", axiosProps);
  await axios(axiosProps);
}

function dummyLedVals(artnetStore: ArtnetStore): void {
  artnetStore.rVal = addRandomValue(artnetStore.rValue, 10);
  artnetStore.gVal = addRandomValue(artnetStore.gValue, 10);
  artnetStore.bVal = addRandomValue(artnetStore.bValue, 10);

  const numberOfLeds = 150;
  const ledVals: number[] = [];
  for (let i = 0; i < numberOfLeds; i++) {
    ledVals.push(Math.round(artnetStore.rValue + i / 5));
    ledVals.push(Math.round(artnetStore.gValue + i / 5));
    ledVals.push(Math.round(artnetStore.bValue + i / 5));
  }
  sendViaAxios(ledVals);
}

async function statisticsLedVals(
  artnetStore: ArtnetStore,
  mapStore: MapStore
  // config: Config
): Promise<void> {
  if (mapStore.mapView) {
    console.log("layers", mapStore.mapView.map.layers);

    const flvs = mapStore.mapView.layerViews.filter(
      (lv: LayerView) =>
        lv.layer.id ===
        "Mexico_demographics_9019_2472_1207_1266_5291_8139_3705_8933_6649_5451"
    );
    const flv = flvs?.getItemAt(0) as FeatureLayerView;
    console.log(
      "flv",
      flv.layer.fields.map((field: any) => field.name)
    );
    console.log("renderer", flv.layer.renderer);

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
    const query = flv.createQuery();
    query.outStatistics = statDefinitions as __esri.StatisticDefinition[];
    query.geometry = mapStore.mapView.extent;

    const statsResult = await flv.queryFeatures(query);
    console.log("statsResult", statsResult.features);

    artnetStore.rVal = addRandomValue(artnetStore.rValue, 10);
    artnetStore.gVal = addRandomValue(artnetStore.gValue, 10);
    artnetStore.bVal = addRandomValue(artnetStore.bValue, 10);

    const numberOfLeds = 150;
    const ledVals: number[] = [];
    for (let i = 0; i < numberOfLeds; i++) {
      ledVals.push(Math.round(artnetStore.rValue + i / 5));
      ledVals.push(Math.round(artnetStore.gValue + i / 5));
      ledVals.push(Math.round(artnetStore.bValue + i / 5));
    }
    sendViaAxios(ledVals);
  } else {
    console.error(`No map view.`);
  }
}

const ArtnetCmp: React.FC<ArtnetCmpProps> = observer(
  (props: ArtnetCmpProps) => {
    const { artnetStore, mapStore } = useStores();

    useEffect(() => {
      // dummyLedVals(artnetStore);
      statisticsLedVals(artnetStore, mapStore);
    }, [artnetStore, mapStore.stationary]);

    // const response = fetch("http://127.0.0.1:9000", {
    //   method: "post",
    //   body: JSON.stringify(ledVals),
    //   headers: { "Content-Type": "application/json" },
    // });
    // console.log(response);

    // const axiosProps = {
    //   method: "post",
    //   url: "http://127.0.0.1:9000",
    //   data: ledVals,
    //   headers: { "Content-Type": "application/json" },
    // };
    // console.log("sending via axios", axiosProps);
    // axios(axiosProps);

    // curl -X POST 127.0.0.1:9000 -H "Content-Type: application/json" -d "[0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,0,255,150,255,255,0]"

    return (
      <div id="artnet">
        <p>
          {artnetStore.rValue} | {artnetStore.gValue} | {artnetStore.bValue}
        </p>
        <p>{mapStore.stationary ? "stationary" : "moving"}</p>
      </div>
    );
  }
);

export default ArtnetCmp;
