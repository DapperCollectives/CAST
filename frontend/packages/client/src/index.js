import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import App from './App';
import './index.css';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_URL,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.3,
});

ReactDOM.render(<App />, document.getElementById('root'));
