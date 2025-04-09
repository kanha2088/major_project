import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import NewUser from "./components/NewUser";
import Scanner from "./components/Scanner";
import "./App.css";
import rds from "./components/rds.png";

function App() {
  return (
    <Router>
      <div className="app">
        {/* Fixed Header with Logo and Navigation */}
        <header className="navbar">
          <div className="logo-container">
            <img src={rds} alt="Logo" className="logo" />
            <span className="website-name">
              <Link to="/" style={{ textDecoration: "none" }}>
                Ration Distribution System
              </Link>
            </span>
          </div>
          <nav className="navbar-links">
            <Link to="/register" className="nav-link btn">Register</Link>
            <Link to="/scan" className="nav-link btn">Scan</Link>
          </nav>
        </header>

        {/* Main Content */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<NewUser />} />
            <Route path="/scan" element={<Scanner />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="site-name">Ration </h1>
        <h1 className="site-name">Distribution </h1>
        <h1 className="site-name">System</h1>
        
      </div>
    </div>
  );
}

export default App;
