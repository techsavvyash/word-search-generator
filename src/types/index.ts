export type QuestionProps = {
  question: string;
  options: {
    correct: string;
    incorrect: string;
  };
};

export type WordSearchParams = {
  colors?: {
    base?: string;
    intermediate?: string;
    top?: string;
    text?: string;
  };
  font?: {
    fontSize?: number;
  };
  translate?: {
    xCoord?: number,
    yCoord?: number,
    zCoord?: number
    horizontalSpacing?: number,
    verticalSpacing?: number,
  };
  dimensions?: {
    width?: number,
    height?: number,
  };
  project?: {
    uuid?: string;
  };
}