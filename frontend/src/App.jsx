import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRouter />
    </BrowserRouter>
  );
};

export default App;