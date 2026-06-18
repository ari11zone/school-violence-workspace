import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Investigation from './pages/Investigation';
import Statements from './pages/Statements';
import Deliberation from './pages/Deliberation';
import Packaging from './pages/Packaging';
import Admin from './pages/Admin';
import { CaseProvider } from './context/CaseContext';

function App() {
  return (
    <CaseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="investigation" element={<Investigation />} />
            <Route path="statements" element={<Statements />} />
            <Route path="deliberation" element={<Deliberation />} />
            <Route path="packaging" element={<Packaging />} />
            <Route path="admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CaseProvider>
  );
}

export default App;

