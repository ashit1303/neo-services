import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import CandidateProfile from './pages/CandidateProfile';
import CandidateDetail from './pages/CandidateDetail';
import EditorPage from './pages/EditorPage';
import Layout from './components/Layout';
import ConnectionsList from './pages/ConnectionsList';
import ConnectionsChat from './pages/ConnectionsChat';
import ConnectionsNotification from './pages/ConnectionsNotifications';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} /> */}
         <Route path="/" element={<EditorPage />} />
        {/* <Route element={<Layout/>}>
        <Route path="/" element={<CandidateProfile />} />
        <Route path="/connection" element={<ConnectionsList/>} />
        <Route path="/chat" element={<ConnectionsChat/>} />
        <Route path="/notifications" element={<ConnectionsNotification/>} />

        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;