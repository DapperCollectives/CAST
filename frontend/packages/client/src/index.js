import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import App from './App';
import './index.css';

// hack for buffer error on react-scripts version > 5
window.Buffer = window.Buffer || require('buffer').Buffer;

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_URL,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.3,
});

ReactDOM.render(<App />, document.getElementById('root'));
