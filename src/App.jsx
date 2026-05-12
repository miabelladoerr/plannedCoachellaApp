import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Home from "./pages/Home.jsx";
import WeekendPage from "./pages/WeekendPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/weekend1" element={<WeekendPage weekend={1} />} />
          <Route path="/weekend2" element={<WeekendPage weekend={2} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
