import React from 'react';

const AchievementBadge = ({ achievement }) => {
    return (
        <div className="group relative flex flex-col items-center cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-3xl shadow-md group-hover:from-yellow-300 group-hover:to-yellow-500 transition-all duration-300 transform group-hover:scale-110">
                {achievement.icon}
            </div>
            <p className="text-xs mt-2 font-semibold text-center w-20 truncate text-textSecondary group-hover:text-textPrimary">{achievement.name}</p>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 w-max max-w-xs p-3 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <p className="font-bold">{achievement.name} (+{achievement.points} pts)</p>
                <p className="text-xs mt-1">{achievement.description}</p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
            </div>
        </div>
    );
};

export default AchievementBadge;