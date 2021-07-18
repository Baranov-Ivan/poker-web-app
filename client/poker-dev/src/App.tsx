import React from "react";
import "./styles/poker-styles.css";
import { Router } from "./components/Router";
import { Footer } from "./components/Footer";

function App() {
    return (
        <div className="App">
            <Router />
            <Footer />
        </div>
    );
}

export default App;
