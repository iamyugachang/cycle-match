import React from 'react';
import { getMatchTypeName } from '../utils';

const MatchResults = ({ match }) => {
  return (
    <div className="match-results">
      <div className="basis-1/3 text-center">
        <div className="font-bold">
          {getMatchTypeName(match.match_type, match.teachers.length)}
        </div>
      </div>
    </div>
  );
};

export default MatchResults;