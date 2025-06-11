// import React from 'react';
// import { createRoot } from 'react-dom';
// import { Provider } from 'react-redux';
// import {store, persistor} from './store/redux';
// import App from './App';
// import './index.css';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
// import { BrowserRouter } from 'react-router-dom'
// import { PersistGate } from 'redux-persist/integration/react'

// const container = document.getElementById('root');
// const root = createRoot(container);

// root.render(
//   // <React.StrictMode>
//     <Provider store={store}>
//       <PersistGate loading = {null} persistor={persistor}>
//         <BrowserRouter>
//           {/* <GoogleOAuthProvider clientId="181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com"> */}
//             <App />
//           {/* </GoogleOAuthProvider> */}
//         </BrowserRouter>
//       </PersistGate>
//     </Provider>
//   // </React.StrictMode>
// );


import React from 'react';
import ReactDOM from 'react-dom'; // Thay đổi ở đây
import { Provider } from 'react-redux';
import { store, persistor } from './store/redux';
import App from './App';
import './index.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

const container = document.getElementById('root');

// Sử dụng ReactDOM.render thay cho createRoot
ReactDOM.render(
  // <React.StrictMode>
  <>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          {/* <GoogleOAuthProvider clientId="181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com"> */}
            <App />
          {/* </GoogleOAuthProvider> */}
        </BrowserRouter>
      </PersistGate>
    </Provider>
  {/* </React.StrictMode>, */}
  </>,
  container
);
