import React from 'react';
import logo from './logo.svg';
import './styles/App.css';
import './styles/poker-styles.css';
import {HomeScreen} from "./components/HomeScreen";
import {PageControl} from "./components/PageControl";

function App() {
  return (
    <div className="App">
      <PageControl/>
    </div>
  );
}

export default App;
