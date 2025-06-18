import React from 'react';

/**
 * A simple, centered, animated loading spinner using Tailwind CSS.
 */
const Spinner = ({ size = '8', color = 'blue-600' }) => {
    // Dynamically build the class string for size
    const sizeClasses = `h-${size} w-${size}`;

    return (
        <div
            className={`inline-block ${sizeClasses} animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-${color} motion-reduce:animate-[spin_1.5s_linear_infinite]`}
            role="status"
        >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
            </span>
        </div>
    );
};

export default Spinner;