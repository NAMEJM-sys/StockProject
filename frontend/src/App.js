import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home'
import Detail from './pages/Detail'
import Recommendation from './pages/Recommendation'
import FinancialStatements from "./pages/FinancialStatements";
import ComprehensiveAnalysis from "./pages/ComprehensiveAnalysis";


function App() {
    return (
        <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/detail" element={<Detail />} />
                    <Route path="/techchart" element={<Recommendation />} />
                    <Route path="/finance" element={<FinancialStatements />} />
                    <Route path="/comprehensiveanalysis" element={<ComprehensiveAnalysis />}/>
                </Routes>
        </Router>
    );
}

export default App;