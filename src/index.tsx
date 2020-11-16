/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './pages/app/app';
import * as serviceWorker from './serviceWorker';

const Root: React.FC = () => (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

ReactDOM.render(<Root />, document.getElementById('root'));

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept('./pages/app/app', () => {
    ReactDOM.render(<Root />, document.getElementById('root'));
  });
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
