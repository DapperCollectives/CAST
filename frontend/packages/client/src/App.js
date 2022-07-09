import 'react-datepicker/dist/react-datepicker.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './App.sass';
import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3';
import Error from './pages/Error';
import { ErrorHandler } from './components';
import NotificationModalProvider from './contexts/NotificationModal';
import { ErrorBoundary } from 'react-error-boundary';
import AppPages from './pages';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

const isLocalDevMode = process.env.NODE_ENV === 'development';
// create react-query client
const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <Error error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
      onReset={() => (window.location.href = '/')}
    >
      <QueryClientProvider client={queryClient}>
        <Web3Provider network={process.env.REACT_APP_FLOW_ENV}>
          <NotificationModalProvider>
            <Router>
              <ErrorHandler>
                <AppPages />
              </ErrorHandler>
            </Router>
          </NotificationModalProvider>
        </Web3Provider>
        {isLocalDevMode && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
