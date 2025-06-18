// client/src/Pages/ReelsPage.js (NEW FILE)
import React from 'react';

const ReelsPage = () => {
  return (
    <div className="container mx-auto py-10 px-4 text-center">
      <div className="bg-white p-12 rounded-xl shadow-lg max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-sky-600 mb-6">Football Reels</h1>
        <p className="text-xl text-slate-700 mb-4">
          Get ready for amazing football highlights, skills, and moments!
        </p>
        <p className="text-3xl font-semibold text-slate-800 animate-pulse">
          Coming Soon!
        </p>
        <p className="mt-6 text-slate-500">
          We're working hard to bring you an exciting collection of football reels. Stay tuned!
        </p>
        {/* You can add a placeholder image or animation here */}
        <div className="mt-8 text-6xl">🎞️ ⚽</div>
      </div>
    </div>
  );
};

export default ReelsPage;