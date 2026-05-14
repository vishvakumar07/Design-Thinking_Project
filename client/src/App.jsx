import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import AppShell from './components/layout/AppShell';
import useSimulationEngine from './store/useSimulationEngine';

// Pages
import LandingPage    from './pages/LandingPage';
import Dashboard      from './pages/Dashboard';
import Workers        from './pages/Workers';
import WorkerDetail   from './pages/WorkerDetail';
import AlertsPage     from './pages/AlertsPage';
import Analytics      from './pages/Analytics';
import MineMap        from './pages/MineMap';
import AICenter       from './pages/AICenter';
import EmergencyHub   from './pages/EmergencyHub';
import Settings       from './pages/Settings';
import CommandCenter  from './pages/CommandCenter';
import WorkerMobileView from './pages/WorkerMobileView';

// Simulation runner component (inside Router so hooks work)
const SimulationRunner = () => {
  useSimulationEngine();
  return null;
};

function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      {loaded && (
        <Router>
          <SimulationRunner />
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Worker mobile view — standalone */}
            <Route path="/worker-view" element={<WorkerMobileView />} />

            {/* Dashboard shell */}
            <Route element={<AppShell />}>
              <Route path="/dashboard"      element={<Dashboard />} />
              <Route path="/workers"        element={<Workers />} />
              <Route path="/workers/:id"    element={<WorkerDetail />} />
              <Route path="/alerts"         element={<AlertsPage />} />
              <Route path="/analytics"      element={<Analytics />} />
              <Route path="/mine-map"       element={<MineMap />} />
              <Route path="/ai-center"      element={<AICenter />} />
              <Route path="/emergency"      element={<EmergencyHub />} />
              <Route path="/settings"       element={<Settings />} />
              <Route path="/command-center" element={<CommandCenter />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;
