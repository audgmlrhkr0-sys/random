import { Routes, Route } from 'react-router-dom';
import LegacyRedirect from './components/LegacyRedirect';
import { RoomProvider } from './context/RoomContext';
import MainPage from './pages/MainPage';
import TeamPage from './pages/TeamPage';
import DrawPage from './pages/DrawPage';
import ResultPage from './pages/ResultPage';

export default function App() {
  return (
    <Routes>
      <Route element={<RoomProvider />}>
        <Route path="/" element={<MainPage />} />
        <Route path="team/:teamId" element={<TeamPage />} />
        <Route path="draw" element={<DrawPage />} />
        <Route path="result" element={<ResultPage />} />
      </Route>
      <Route path="/r/:roomId/*" element={<LegacyRedirect />} />
    </Routes>
  );
}
