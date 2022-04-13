import "react-datepicker/dist/react-datepicker.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./App.sass";
import React from "react";
import { HashRouter as Router } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3";
import Error from "./pages/Error";
import { ErrorHandler } from "./components";
import NotificationModalProvider from "./contexts/NotificationModal";
import { ErrorBoundary } from "react-error-boundary";
import AppPages from "./pages";

function App() {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <Error error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
      onReset={() => (window.location.href = "/")}
    >
      <Web3Provider network={process.env.REACT_APP_FLOW_ENV}>
        <NotificationModalProvider>
          <Router>
            <ErrorHandler>
              <AppPages />
            </ErrorHandler>
          </Router>
        </NotificationModalProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
}

export default App;
