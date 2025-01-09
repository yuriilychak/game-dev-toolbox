import { createRoot } from 'react-dom/client';

import App from './app';
import fetchLocales from './i18n';

async function init() {
  await fetchLocales();

  const root = createRoot(document.getElementById('app'));

  root.render(<App />);
}

init();
