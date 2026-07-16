import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import { queryClient } from './app/queryClient';
import { ThemeProvider } from './context/ThemeContext';
import { AppWrapper } from './components/common/PageMeta';
import { ScrollToTop } from './components/common/ScrollToTop';
import AppRoutes from './routes';

import 'swiper/swiper-bundle.css';
import 'flatpickr/dist/flatpickr.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppWrapper>
            <Router>
              <ScrollToTop />
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </Router>
          </AppWrapper>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
