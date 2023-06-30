import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SquidGames from "./components/SquidGames/SquidGames";
import WordPuzzle from "./components/WordPuzzle/WordPuzzle";
import Home from "./components/Home/Home";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wordsearch" element={<WordPuzzle />} />
          <Route path="/squidgames" element={<SquidGames />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
