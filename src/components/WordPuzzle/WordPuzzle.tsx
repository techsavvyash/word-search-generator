import { useState } from "react";
import { gen } from "../../utils/generateRJSON";

function WordPuzzle() {
  const [words, setWords] = useState<string>("");
  const [gridSize, setGridSize] = useState<number>(10);

  const [baseLayerColor, setBaseLayerColor] = useState<string>("#0C4494");
  const [intermediateLayerColor, setIntermediateLayerColor] =
    useState<string>("#F8E71C");
  const [topLayerColor, setTopLayerColor] = useState<string>("#AFE1AF");

  const [wordHeight, setWordHeight] = useState<number>(1.5);
  const [wordWidth, setWordWidth] = useState<number>(1.5);
  const [horizontalSpacingBetweenBoxes, setHorizontalSpacingBetweenBoxes] =
    useState<number>(0.5);
  const [verticalSpacingBetweenBoxes, setVerticalSpacingBetweenBoxes] =
    useState<number>(0.5);

  const [fontSize, setFontSize] = useState<number>(1);

  const [projectUUID, setProjectUUID] = useState<string>("");

  return (
    <>
      <div>
        <div>
          <h2> Grid information </h2>
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
        </div>
        <div>
          <h2> Color information </h2>
          <label> Base Layer Color: </label>
          <input
            type="color"
            onChange={(e) => {
              setBaseLayerColor(e.target.value);
            }}
          />
          <label> Intermediate Layer Color: </label>
          <input
            type="color"
            onChange={(e) => {
              setIntermediateLayerColor(e.target.value);
            }}
          />
          <label> Top Layer Color: </label>
          <input
            type="color"
            onChange={(e) => {
              setTopLayerColor(e.target.value);
            }}
          />
        </div>
        <div>
          <h2> Spacing and Sizing information </h2>
          <label> Height of the box </label>
          <input
            type="number"
            onChange={(e) => {
              setWordHeight(parseFloat(e.target.value));
            }}
          />
          <label> Width of the box </label>
          <input
            type="number"
            onChange={(e) => {
              setWordWidth(parseFloat(e.target.value));
            }}
          />
          <label> Horizontal spacing between boxes </label>
          <input
            type="number"
            onChange={(e) => {
              setHorizontalSpacingBetweenBoxes(parseFloat(e.target.value));
            }}
          />
          <label> Vertical spacing between boxes </label>
          <input
            type="number"
            onChange={(e) => {
              setVerticalSpacingBetweenBoxes(parseFloat(e.target.value));
            }}
          />
        </div>
        <div>
          <h2> Font information </h2>
          <label> Font Size: </label>
          <input
            type="number"
            onChange={(e) => {
              setFontSize(parseFloat(e.target.value));
            }}
          />
        </div>
        <div>
          <h2> Project Details </h2>
          <label> Project UUID: </label>
          <input
            type="text"
            onChange={(e) => {
              setProjectUUID(e.target.value);
            }}
          />
        </div>
        <button
          style={{ marginTop: "20px" }}
          onClick={() => {
            const rjson = gen(
              words.split(",").map((word) => word.trim()),
              gridSize,
              {
                colors: {
                  base: baseLayerColor,
                  intermediate: intermediateLayerColor,
                  top: topLayerColor,
                },
                font: {
                  fontSize,
                },
                dimensions: {
                  height: wordHeight,
                  width: wordWidth,
                },
                translate: {
                  yCoord: 0,
                  zCoord: -30,
                  horizontalSpacing: horizontalSpacingBetweenBoxes,
                  verticalSpacing: verticalSpacingBetweenBoxes,
                },
                project: {
                  uuid: projectUUID,
                },
              }
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

export default WordPuzzle;
