import { QuestionProps } from "../../types";

const ShowQuestion = (props: QuestionProps) => {
  return (
    <div>
      <div>{props.question}</div>
      <div> {props.options.correct} </div>
      <div> {props.options.incorrect} </div>
    </div>
  );
};

export default ShowQuestion;
