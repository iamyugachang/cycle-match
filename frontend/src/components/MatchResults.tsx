"use client";

import React, { useState, useEffect } from 'react';
import { MatchResult } from '../types';

interface MatchResultsProps {
  matches?: MatchResult[];
  loading?: boolean;
}

const MatchResults: React.FC<MatchResultsProps> = ({ matches = [], loading = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [previewMatches, setPreviewMatches] = useState<MatchResult[]>([]);

  useEffect(() => {
    // Select only the first few matches for the preview
    setPreviewMatches(matches.length > 0 ? matches.slice(0, 3) : []);
  }, [matches]);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">114年度配對結果</h2>
        <div className="py-8 text-center text-gray-500">正在載入配對結果...</div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">114年度配對結果</h2>
        <div className="py-8 text-center text-gray-500">目前尚無配對結果</div>
      </div>
    );
  }

  const renderTeacherItem = (teacher: any, idx: number) => (
    <div key={`teacher-${idx}`} className="bg-gray-50 p-3 rounded border">
      <div className="font-semibold">{teacher.current_school} ({teacher.subject})</div>
      <div><span className="text-gray-600">現職:</span> {teacher.current_county} {teacher.current_district}</div>
      <div>
        <span className="text-gray-600">希望調往:</span>{' '}
        {teacher.target_counties.map((county: string, i: number) => (
          <span key={`target-${i}`} className="mr-1">
            {county} {teacher.target_districts[i]}{i < teacher.target_counties.length - 1 ? '、' : ''}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">114年度配對結果</h2>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          {expanded ? '收合' : '展開全部'}
        </button>
      </div>

      {/* Preview section - always visible */}
      <div className="space-y-4 mb-4">
        {previewMatches.map((match) => (
          <div key={`preview-match-${match.id}`} className="border p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3">配對組 #{match.id}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {match.teachers.map((teacher, idx) => (
                <div key={`preview-teacher-${match.id}-${idx}`}>
                  {renderTeacherItem(teacher, idx)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Show indication of more results if collapsed */}
      {!expanded && matches.length > previewMatches.length && (
        <div className="text-center text-gray-500 my-4 py-2 border-t border-b border-gray-200">
          ...還有 {matches.length - previewMatches.length} 組配對結果
        </div>
      )}

      {/* Full results - only visible when expanded */}
      {expanded && matches.length > previewMatches.length && (
        <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
          {matches.slice(previewMatches.length).map((match) => (
            <div key={`full-match-${match.id}`} className="border p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-3">配對組 #{match.id}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {match.teachers.map((teacher, idx) => (
                  <div key={`full-teacher-${match.id}-${idx}`}>
                    {renderTeacherItem(teacher, idx)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchResults;
