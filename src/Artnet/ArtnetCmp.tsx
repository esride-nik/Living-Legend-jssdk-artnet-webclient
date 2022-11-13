import * as React from "react";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { useStores } from "../Stores/useStores";
import "./Artnet.css";
import axios from "axios";
import ArtnetStore from "./ArtnetStore";

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

function getDummyLedVals(artnetStore: ArtnetStore): number[] {
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
  return ledVals;
}

const ArtnetCmp: React.FC<ArtnetCmpProps> = observer(
  (props: ArtnetCmpProps) => {
    const { artnetStore, mapStore } = useStores();

    useEffect(() => {
      const ledVals = getDummyLedVals(artnetStore);
      sendViaAxios(ledVals);
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
