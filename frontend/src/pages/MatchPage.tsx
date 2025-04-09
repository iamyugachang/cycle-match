import React, { useEffect, useState } from "react";
import { MatchResult } from "../types";
import { getMatchTypeName, getVisibleMatches, sortMatches } from "../utils/matchUtils";
import MatchCard from "../components/MatchCard";

const MainPage: React.FC = () => {
  const [matches, setMatches] = useState<MatchResult[]>([]);

  useEffect(() => {
    // Fetch match results and set state
    const fetchMatches = async () => {
      const response = await fetch("/api/matches");
      const data: MatchResult[] = await response.json();
      setMatches(data);
    };

    fetchMatches();
  }, []);

  const visibleMatches = getVisibleMatches(matches);
  const sortedMatches = sortMatches(visibleMatches);

  return (
    <div>
      <h1>Match Results</h1>
      {sortedMatches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
};

export default MainPage;