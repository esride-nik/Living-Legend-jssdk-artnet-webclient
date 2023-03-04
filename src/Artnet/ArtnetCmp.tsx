import * as React from "react";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { useStores } from "../Stores/useStores";
import "./Artnet.css";
import axios from "axios";
import ArtnetStore, { LedNumsAndColors } from "./ArtnetStore";
import MapStore from "Map/MapStore";
import Color from "@arcgis/core/Color";

interface ArtnetCmpProps {}

const totalNumberOfLeds = 150;

async function sendViaAxios(ledVals: number[]) {
  const axiosProps = {
    method: "post",
    url: "http://127.0.0.1:9000",
    data: ledVals,
    headers: { "Content-Type": "application/json" },
  };
  console.debug("sending via axios", axiosProps);
  await axios(axiosProps);
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

  // Get the data
  const { features } = await artnetStore.flv.queryFeatures();

  artnetStore.setLedNumsAndColors([]);
  const predominantValueExecutorPromises = features.map(async (feature) => {
    // Execute the Arcade expression for each feature in the layer view
    const data =
      await artnetStore.uniqueValueExpressionArcadeExecutor?.executeAsync({
        $feature: feature,
        $view: artnetStore.flv,
      });
    const found = artnetStore.ledNumsAndColors.find(
      (l: LedNumsAndColors) => l.value === data
    );
    if (found !== undefined) {
      found.numFeatures++;
    } else {
      artnetStore.pushLedNumsAndColors({
        value: data,
        numFeatures: 1,
      } as LedNumsAndColors);
    }
    return data;
  });
  // When all promises are fulfilled, the list in artnetStore.ledNumsAndColors is complete
  await Promise.all(predominantValueExecutorPromises);

  // Get renderer colors
  if (artnetStore.flv.layer.renderer.type === "unique-value") {
    (
      artnetStore.flv.layer.renderer as __esri.UniqueValueRenderer
    ).uniqueValueInfos.forEach((u: __esri.UniqueValueInfo) => {
      const found = artnetStore.ledNumsAndColors.find(
        (l: LedNumsAndColors) => l.value === u.value
      );
      if (found !== undefined) {
        found.color = u.symbol.color;
      }
    });
  }

  // Overwrite LedColors
  artnetStore.ledNumsAndColors.forEach((l: LedNumsAndColors) => {
    const correctionColor = new Color({ r: 50, g: 10, b: 10 });
    l.ledColor = Color.blendColors(l.color, correctionColor, 0.5);
  });

  // Data to LEDs
  artnetStore.ledNumsAndColors.forEach(
    (l: LedNumsAndColors) =>
      (l.numPercentage = (l.numFeatures / features.length) * 100)
  );

  artnetStore.ledNumsAndColors.forEach(
    (l: LedNumsAndColors) =>
      (l.numLeds = Math.round(totalNumberOfLeds * (l.numPercentage / 100)))
  );

  const ledVals: number[] = [];
  const ledValsRows: number[][] = [];
  ledValsRows.push([]);
  ledValsRows.push([]);
  ledValsRows.push([]);
  ledValsRows.push([]);
  ledValsRows.push([]);
  ledValsRows.push([]);

  artnetStore.ledNumsAndColors.forEach((lc: LedNumsAndColors) => {
    const numRows = 6;
    const numLedsPerRow = Math.round(lc.numLeds / numRows);
    for (let n = 0; n < numRows; n++) {
      let row: number[] = [];
      for (let i = 0; i < numLedsPerRow; i++) {
        row.push(Math.round(factorizeColor(lc.ledColor.r) * 0.2));
        row.push(Math.round(factorizeColor(lc.ledColor.g)));
        row.push(Math.round(factorizeColor(lc.ledColor.b) * 0.5));
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
      statisticsLedVals(artnetStore, mapStore);
    }, [artnetStore, mapStore, mapStore.stationary]);

    return (
      <div id="artnet">
        {mapStore.stationary ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 32 32"
            className="svg-icon"
          >
            <path d="M26 4v24h-6V4h6zM6 28h6V4H6v24z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 32 32"
            className="svg-icon"
          >
            <path d="M32.047 16.047l-6-6v4H18V6h4L16.047.047l-6 5.953h4v8.047H6v-4l-5.953 6 5.953 6V18h8.047v8.047h-4l6 6 6-6H18V18h8.047v4.047z" />
          </svg>
        )}
        <div className="legend-container">
          {artnetStore.ledNumsAndColors.map((l: LedNumsAndColors) => {
            return (
              <div
                key={l.value}
                style={{
                  backgroundColor:
                    l !== undefined && l.color !== undefined
                      ? l.color.toHex()
                      : "#000000",
                  display: "inline-block",
                  width: `${
                    l !== undefined && l.numLeds !== undefined
                      ? l.numLeds * 3
                      : 5
                  }px`,
                  height: "20px",
                }}
              >
                {l !== undefined && l.numLeds !== undefined ? l.numLeds : ""}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

export default ArtnetCmp;
