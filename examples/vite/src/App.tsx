import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import LoggerPage from "@/pages/logger";
import AdvancedPage from "@/pages/advanced";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<LoggerPage />} path="/logger" />
      <Route element={<AdvancedPage />} path="/advanced" />
    </Routes>
  );
}

export default App;
