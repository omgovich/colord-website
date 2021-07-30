import { useEffect, useState } from "react";

export const useStargazerCount = (): number => {
  const [count, setCount] = useState(450);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      fetch("https://api.github.com/repos/omgovich/colord").then((result) => {
        result.json().then((data) => setCount(data.stargazers_count));
      });
    }
  }, []);

  return count;
};