import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
// import { gen } from "./utils/generateRJSON";
import { genSquidGames } from "./utils/genSquidGames";

const questions = [
  {
    question: "What is the name of the game?",
    options: {
      correct: "Squid Game",
      incorrect: "Word Search",
    },
  },
  {
    question: "Where does squid games air?",
    options: {
      correct: "Netflix",
      incorrect: "Amazon Prime",
    },
  },
  {
    question: "Is Squid Games Korean?",
    options: {
      correct: "Yes",
      incorrect: "No",
    },
  },
];

function SquidGame() {
  const [words, setWords] = useState<string>("");

  const [gridSize, setGridSize] = useState<number>(10);

  return (
    <>
      <div>
        <button
          style={{ marginTop: "20px" }}
          onClick={() => {
            const rjson = genSquidGames(questions);
            console.log(rjson);
            alert("RJson has been printed on your console");
          }}
        >
          {" "}
          Generate RJson for Squid Games
        </button>
      </div>
    </>
  );
}

export default SquidGame;
