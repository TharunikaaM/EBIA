import React from 'react';

const Skeleton = () => (
  <div className="space-y-4 animate-pulse mt-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="bg-white/5 rounded-2xl h-40 glass" />
      <div className="lg:col-span-2 bg-white/5 rounded-2xl h-40 glass" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white/5 rounded-2xl h-28 glass" />
      ))}
    </div>
    <div className="bg-white/5 rounded-2xl h-48 glass" />
  </div>
);

export default Skeleton;
