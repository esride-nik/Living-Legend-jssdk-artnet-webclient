import * as React from "react";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { useStores } from "../Stores/useStores";
import "./Artnet.css";

interface ArtnetCmpProps {}

const ArtnetCmp: React.FC<ArtnetCmpProps> = observer(
  (props: ArtnetCmpProps) => {
    const { artnetStore, mapStore } = useStores();

    // useEffect(() => {
    //   statusStore.changeCounter++;
    //   statusStore.statusMessage = `Center changed ${statusStore.changeCounter} times.`;
    // }, [statusStore, mapStore.center]);

    return (
      <div id="artnet">
        <p>{artnetStore.statusMessage}</p>
      </div>
    );
  }
);

export default ArtnetCmp;
