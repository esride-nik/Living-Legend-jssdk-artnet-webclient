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
import Layer from "@arcgis/core/layers/Layer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Color from "@arcgis/core/Color";
// import StatisticDefinition = require("esri/tasks/StatisticDefinition");

export type LedNumsAndColors = {
  numLeds: number;
  color: Color;
};

interface ArtnetCmpProps {}

const totalNumberOfLeds = 150;

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

function distLedVals(artnetStore: ArtnetStore): void {
  const numberOfLeds = 150;
  const ledVals: number[] = [];

  var data = [],
    a = 1,
    b = 2;

  for (let i = 0; i < numberOfLeds; i++) {
    const factor = a * Math.pow(b, 0.0065 * i) - 1;
    data.push(factor);

    ledVals.push(i * factor);
    ledVals.push(i * factor);
    ledVals.push(0);
  }

  console.log(
    "expData",
    JSON.stringify(data),
    data[75] - data[50],
    data[125] - data[100]
  );

  console.log("dist ledVals", ledVals);
  sendViaAxios(ledVals);
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
  if (!mapStore.mapView) {
    console.warn(`No map view.`);
    return;
  } else if (!artnetStore.flv) {
    console.warn(`No feature layer view.`);
    return;
  }
  const statsResult = await artnetStore.flv.queryFeatures(
    artnetStore.statsQuery
  );
  const stats = statsResult.features[0].attributes;
  // console.log("stats", stats);

  // const updatedData = [
  //   stats.EDUC01_CY_TOTAL, // no school
  //   stats.EDUC02_CY_TOTAL, // preschool
  //   stats.EDUC03_CY_TOTAL, // some elementary
  //   stats.EDUC04_CY_TOTAL + stats.EDUC07_CY_TOTAL, // elementary
  //   stats.EDUC05_CY_TOTAL, // some secondary
  //   stats.EDUC06_CY_TOTAL + stats.EDUC08_CY_TOTAL, // secondary
  //   stats.EDUC09_CY_TOTAL + stats.EDUC11_CY_TOTAL, // high school
  //   stats.EDUC10_CY_TOTAL +
  //     stats.EDUC12_CY_TOTAL +
  //     stats.EDUC13_CY_TOTAL +
  //     stats.EDUC14_CY_TOTAL +
  //     stats.EDUC15_CY_TOTAL, // college
  //   stats.EDUC16_CY_TOTAL, // not specified
  // ].sort((a, b) => b - a);
  const updatedData = [
    stats.EDUC01_CY_TOTAL, // no school
    // stats.EDUC02_CY_TOTAL, // preschool
    stats.EDUC03_CY_TOTAL, // some elementary
    // stats.EDUC04_CY_TOTAL + stats.EDUC07_CY_TOTAL, // elementary
    // stats.EDUC06_CY_TOTAL + stats.EDUC08_CY_TOTAL, // secondary
    // stats.EDUC09_CY_TOTAL + stats.EDUC11_CY_TOTAL, // high school
    // stats.EDUC10_CY_TOTAL +
    //   stats.EDUC12_CY_TOTAL +
    //   stats.EDUC13_CY_TOTAL +
    stats.EDUC14_CY_TOTAL + stats.EDUC15_CY_TOTAL, // college
  ].sort((a, b) => b - a);

  const updatedDataPlus = updatedData.map((v: number) => v + +10000);

  let totalUpdatedData = 0;
  updatedDataPlus.forEach((v: number) => (totalUpdatedData += v));

  const updatedDataPercentage = updatedDataPlus.map(
    (v: number) => (v / totalUpdatedData) * 100
  );
  let checkTotalData = 0;
  updatedDataPercentage.forEach((v: number) => (checkTotalData += v));

  const numLedsPerClass = updatedDataPercentage.map((v: number) =>
    Math.round(totalNumberOfLeds * (v / 100))
  );
  let checkTotalLeds = 0;
  numLedsPerClass.forEach((v: number) => (checkTotalLeds += v));

  console.log(
    "percentage",
    updatedData,
    updatedDataPercentage,
    checkTotalData,
    numLedsPerClass,
    checkTotalLeds
  );

  console.log("layer", artnetStore.flv.layer.renderer);

  if (artnetStore.flv.layer.renderer.type === "unique-value") {
    artnetStore.colors = [];
    artnetStore.colors.push(
      ...(
        artnetStore.flv.layer.renderer as __esri.UniqueValueRenderer
      ).uniqueValueInfos.map((ui: __esri.UniqueValueInfo) => ui.symbol.color)
    );
  }

  const ledNumsAndColors = numLedsPerClass.map((numLeds: number, i: number) => {
    return {
      numLeds: numLeds,
      color: new Color(artnetStore.colors[i]),
    } as LedNumsAndColors;
  });
  artnetStore.ledNumsAndColors = ledNumsAndColors;

  const ledVals: number[] = [];
  const ledValsRows: number[][] = [];
  ledValsRows.push([]);
  ledValsRows.push([]);
  ledValsRows.push([]);
  ledValsRows.push([]);
  ledValsRows.push([]);
  ledValsRows.push([]);

  artnetStore.ledNumsAndColors.forEach((lc: LedNumsAndColors) => {
    console.log("lc", lc);
    const numRows = 6;
    const numLedsPerRow = Math.round(lc.numLeds / numRows);
    console.log("numLedsPerRow", numLedsPerRow, numRows);
    for (let n = 0; n < numRows; n++) {
      let row: number[] = [];
      for (let i = 0; i < numLedsPerRow; i++) {
        row.push(Math.round(factorizeColor(lc.color.r) * 0.2));
        row.push(Math.round(factorizeColor(lc.color.g)));
        row.push(Math.round(factorizeColor(lc.color.b) * 0.5));
      }
      ledValsRows[n].push(...row);
    }
  });
  const ledValsRowClipped = ledValsRows.map((r: number[], i: number) => {
    let slicedRow = r.slice(0, 75);
    if (i % 2 > 0) {
      slicedRow = reverseRgbRow(slicedRow);
    }
    while (slicedRow.length < 75) {
      const r = slicedRow[slicedRow.length - 3];
      const g = slicedRow[slicedRow.length - 2];
      const b = slicedRow[slicedRow.length - 1];
      slicedRow.push(r, g, b);
    }
    // console.log(slicedRow.length, slicedRow);
    return slicedRow;
  });
  ledVals.push(...ledValsRowClipped.flat());

  sendViaAxios(ledVals);
}

function reverseRgbRow(row: number[]) {
  const reversedRow: number[] = [];
  let b = row.pop();
  let g = row.pop();
  let r = row.pop();
  while (r !== undefined && g !== undefined && b !== undefined) {
    reversedRow.push(r);
    reversedRow.push(g);
    reversedRow.push(b);
    b = row.pop();
    g = row.pop();
    r = row.pop();
  }
  return reversedRow;
}

function factorizeColor(c: number): number {
  const newC = (c / 255) * 150;
  const a = 1;
  const b = 2;
  return (a * Math.pow(b, 0.0065 * newC) - 1) * c;
}

const ArtnetCmp: React.FC<ArtnetCmpProps> = observer(
  (props: ArtnetCmpProps) => {
    const { artnetStore, mapStore } = useStores();

    useEffect(() => {
      // distLedVals(artnetStore);
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
          {artnetStore.ledNumsAndColors.map(
            (n: LedNumsAndColors) => `${n.color}: ${n.numLeds}\n`
          )}
        </p>
        <p>{mapStore.stationary ? "stationary" : "moving"}</p>
        {artnetStore.colors.map((c: __esri.Color) => {
          return (
            <div
              style={{ marginRight: "5em" }} //{`background-color:${c.toHex};display:block;width:20px;height:20px;`}
            ></div>
          );
        })}
      </div>
    );
  }
);

export default ArtnetCmp;
