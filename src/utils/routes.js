import * as React from "react";
import { Route } from "react-router-dom";
import { Configuration } from "pages/configuration";
import { Setting } from "pages/settings";

const routeConfig = [
  <Route exact path={`/configuration`} render={() => <Configuration />} />,
  <Route exact path={`/settings`} render={() => <Setting />} />,
];

export default routeConfig;
