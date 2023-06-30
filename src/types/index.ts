export type QuestionProps = {
  question: string;
  options: {
    correct: string;
    incorrect: string;
  };
};