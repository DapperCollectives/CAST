import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// eslint-disable-next-line no-unused-vars
import * as Buffer from "./polyfill";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
