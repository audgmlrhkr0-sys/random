import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import TeamPage from './pages/TeamPage';
import DrawPage from './pages/DrawPage';
import ResultPage from './pages/ResultPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/team/:teamId" element={<TeamPage />} />
      <Route path="/draw" element={<DrawPage />} />
      <Route path="/result" element={<ResultPage />} />
    </Routes>
  );
}
