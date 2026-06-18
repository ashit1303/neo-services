import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import CandidateProfile from './pages/CandidateProfile';
import CandidateDetail from './pages/CandidateDetail';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {/* <Route path="/" element={<CandidateProfile />} /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;