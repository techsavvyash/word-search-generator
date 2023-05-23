import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { gen } from "./utils/generateRJSON";

function App() {
  const [words, setWords] = useState<string>("");

  const [gridSize, setGridSize] = useState<number>(10);

  return (
    <>
      <div>
        <div>
          <p> Enter the comma separated list of words </p>
          <input type="text" onChange={(e) => setWords(e.target.value)} />
        </div>
        <div>
          <p> Enter the gridSize </p>
          <input
            type="number"
            onChange={(e) => setGridSize(parseFloat(e.target.value))}
          />
        </div>
        <button
          style={{ marginTop: "20px" }}
          onClick={() => {
            const rjson = gen(
              words.split(",").map((word) => word.trim()),
              gridSize
            );
            console.log(rjson);
            alert("RJson has been printed on your console");
          }}
        >
          {" "}
          Generate RJson
        </button>
      </div>
    </>
  );
}

export default App;
