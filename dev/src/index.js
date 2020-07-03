import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {createStore, applyMiddleware } from 'redux'
import {Provider} from 'react-redux'
import rootReducer from './reducer/root-reducer'
import * as serviceWorker from './serviceWorker';
import thunk from 'redux-thunk';

const store = createStore(rootReducer, applyMiddleware(thunk))
ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
serviceWorker.unregister();
// ReactDOM.render(<App />, document.getElementById('root'));