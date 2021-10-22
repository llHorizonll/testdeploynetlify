import "react-app-polyfill/ie9";
import "react-app-polyfill/ie11";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { SnackbarProvider } from "notistack";
import { FormatterProvider } from "./providers/formatter";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

import "./index.css";

ReactDOM.render(
  <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
  >
    <FormatterProvider>
      <App />
    </FormatterProvider>
  </SnackbarProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
