import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

import CandidateProfile from "./pages/CandidateProfile";
import EditorPage from "./pages/EditorPage";
import CandidateBlogs from "./pages/CandidateBlogs";

import ConnectionsList from "./pages/ConnectionsList";
import ConnectionsChat from "./pages/ConnectionsChat";
import ConnectionsNotification from "./pages/ConnectionsNotifications";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateCandidateProfile from "./pages/CreateCandidateProfile";
import CandidateEditProfile from "./pages/CandidateEditProfile";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LandingPage />}/>

        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/verify-email" element={<VerifyEmail />}/>

        <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/candidate-profile" element={<CandidateProfile />}/>
          <Route path="/create-profile" element={<CreateCandidateProfile />}/>
          <Route path="/edit-profile" element={<CandidateEditProfile />}/>
          <Route path="/candidate-blogs" element={<CandidateBlogs />}/>

          <Route path="/connections" element={<ConnectionsList />}/>
          <Route path="/chat" element={<ConnectionsChat />}/>
          <Route path="/notifications" element={<ConnectionsNotification />}/>
          

        </Route>

        <Route path="/editor" element={<EditorPage />}/>

        <Route path="*" element={<Navigate to="/login" replace />}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;






// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import VerifyEmail from './pages/VerifyEmail';
// import CandidateProfile from './pages/CandidateProfile';
// import CandidateDetail from './pages/CandidateDetail';
// import EditorPage from './pages/EditorPage';
// import Layout from './components/Layout';
// import ConnectionsList from './pages/ConnectionsList';
// import ConnectionsChat from './pages/ConnectionsChat';
// import ConnectionsNotification from './pages/ConnectionsNotifications';


// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/verify-email" element={<VerifyEmail />} /> */}
//          <Route path="/" element={<EditorPage />} />
//          {/* <Route path="/" element={<CandidateDetail />} /> */}
//         {/* <Route element={<Layout/>}>
//         <Route path="/" element={<CandidateProfile />} />
//         <Route path="/connection" element={<ConnectionsList/>} />
//         <Route path="/chat" element={<ConnectionsChat/>} />
//         <Route path="/notifications" element={<ConnectionsNotification/>} />

//         </Route> */}
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;