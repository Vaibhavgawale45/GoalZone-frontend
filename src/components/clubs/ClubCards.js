// client/src/components/clubs/ClubCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const ClubCard = ({ club }) => {
  // Ensure club data and its properties are available before trying to access them
  const clubName = club?.name || 'Unnamed Club';
  const clubId = club?._id; // Use _id from MongoDB
  const clubDescription = club?.description || 'No description available.';
  const clubLocation = club?.location || 'N/A';
  const clubRating = club?.rating;
  const clubImageUrl = club?.imageUrl || club?.logoUrl || `https://via.placeholder.com/400x200.png?text=${encodeURIComponent(clubName)}`;

  if (!clubId) {
    // Fallback or error display if club ID is missing, though ideally filtered out before this point
    return <div className="bg-white rounded-lg shadow-lg p-4 text-red-500">Club data incomplete.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col h-full group">
      <Link to={`/club/${clubId}`} className="block">
        <div className="relative h-48 w-full overflow-hidden">
           <img
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={clubImageUrl}
            alt={clubName}
          />
        </div>
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <Link to={`/club/${clubId}`} className="block mb-2">
            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{clubName}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-1">
          <span className="font-medium">Location:</span> {clubLocation}
        </p>
        <p className="text-gray-600 text-sm mb-3">
          <span className="font-medium">Rating:</span>
          {typeof clubRating === 'number' ? (
            <span className="ml-1 text-yellow-500">
              {'★'.repeat(Math.floor(clubRating))}
              {'☆'.repeat(5 - Math.floor(clubRating))} ({clubRating.toFixed(1)})
            </span>
          ) : (
            <span className="ml-1 text-gray-400">Not Rated</span>
          )}
        </p>
        <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
          {clubDescription.substring(0, 100)}{clubDescription.length > 100 ? '...' : ''}
        </p>
        <Link
           to={`/club/${clubId}`} // Links to the club's detail page using _id
           className="mt-auto self-start inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-5 rounded-md transition duration-150 ease-in-out text-sm"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default ClubCard;