import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
injectTapEventPlugin();

const muiTheme = getMuiTheme({
    fontFamily: 'Nunito, sans-serif',
    palette: {
        primary1Color: "#1c5c7f",
        accent1Color: "#53c9e8"
    }
});

// Split location into `/` separated parts, then render `Application` with it
function handleNewHash() {
  var location = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');

  var application = (
    <MuiThemeProvider muiTheme={muiTheme}>
      <App location={location} />
    </MuiThemeProvider>
  );

  ReactDOM.render(application, document.getElementById('root'));
}


// Handle the initial route and browser navigation events
handleNewHash()
window.addEventListener('hashchange', handleNewHash, false);
