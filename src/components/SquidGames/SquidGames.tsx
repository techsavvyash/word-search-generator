import { useState } from "react";
import { QuestionProps } from "../../types";
import ShowQuestion from "./ShowQuestion";
import { genSquidGames } from "../../utils/genSquidGames";

const SquidGames = () => {
  const [questions, setQuestions] = useState<QuestionProps[]>([]);
  const [ques, setQues] = useState<string>("");
  const [correct, setCorrect] = useState<string>("");
  const [incorrect, setIncorrect] = useState<string>("");
  const [uuid, setUUID] = useState<string>("");
  return (
    <>
      <div>
        <div>
          <div>
            <label> Question: </label>
            <input
              type="text"
              onChange={(event) => {
                setQues(event.target.value);
              }}
            />
          </div>
          <div>
            <label> Correct Ans: </label>
            <input
              type="text"
              onChange={(event) => {
                setCorrect(event.target.value);
              }}
            />
          </div>
          <div>
            <label> Incorrect Ans: </label>
            <input
              type="text"
              onChange={(event) => {
                setIncorrect(event.target.value);
              }}
            />
          </div>
          <button
            onClick={() => {
              const newQuestion = {
                question: ques,
                options: {
                  correct: correct,
                  incorrect: incorrect,
                },
              };
              setQuestions([...questions, newQuestion]);
            }}
          >
            {" "}
            Add Question{" "}
          </button>
        </div>
        <div>
          <label> Project uuid: </label>
          <input
            type="text"
            onChange={(e) => {
              setUUID(e.target.value);
            }}
          />
        </div>
        <div>
          <div> Added Questions </div>
          <div>
            {questions.map((question, index) => {
              return <ShowQuestion {...question} key={index} />;
            })}
          </div>
        </div>
      </div>
      <div>
        <button
          style={{ marginTop: "20px" }}
          onClick={() => {
            const rjson = genSquidGames(questions, uuid);
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
};

export default SquidGames;
