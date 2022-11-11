import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { StoreProvider } from "./Stores/StoreProvider";
import { getConfiguration } from "./Config/configuration";

let configuration: any = undefined;
(async () => {
  configuration = await getConfiguration();

  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );
  root.render(
    <StoreProvider config={configuration}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </StoreProvider>
  );
})();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
