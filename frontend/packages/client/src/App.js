import 'react-datepicker/dist/react-datepicker.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { ErrorBoundary } from 'react-error-boundary';
import { HashRouter as Router } from 'react-router-dom';
import NotificationModalProvider from 'contexts/NotificationModal';
import { Web3Provider } from 'contexts/Web3';
import { theme } from '@cast/shared-components';
import { ErrorHandler } from 'components';
import { IS_PRODUCTION } from 'const';
import { ChakraProvider } from '@chakra-ui/react';
import Hotjar from '@hotjar/browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import detectTouchScreen from 'helpers/detectTouchScreen';
import AppPages from 'pages';
import Error from 'pages/Error';
import './App.sass';

const hotjarVersion = 6;
Hotjar.init(process.env.REACT_APP_HOTJAR_SITE_ID, hotjarVersion);

// create react-query client
const queryClient = new QueryClient();

function App() {
  const hasTouchScreen = detectTouchScreen();
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <Error error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
      onReset={() => (window.location.href = '/')}
    >
      <QueryClientProvider client={queryClient}>
        <Web3Provider network={process.env.REACT_APP_FLOW_ENV}>
          <Router>
            <ChakraProvider theme={theme}>
              <NotificationModalProvider>
                <ErrorHandler>
                  <DndProvider
                    backend={hasTouchScreen ? TouchBackend : HTML5Backend}
                  >
                    <AppPages />
                  </DndProvider>
                </ErrorHandler>
              </NotificationModalProvider>
            </ChakraProvider>
          </Router>
        </Web3Provider>
        {!IS_PRODUCTION && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
