import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import { Popup } from './Popup';

render(
  <StrictMode>
    <Popup />
  </StrictMode>,
  document.getElementById('root'),
);
