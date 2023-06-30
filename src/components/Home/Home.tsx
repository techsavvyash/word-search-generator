import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <div>
        <h3> Welcome to the RJSON Game Generator </h3>
        <div>
          <Link to="/wordsearch"> Word Search </Link>
        </div>
        <div>
          <Link to="/squidgames"> Squid Games </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
