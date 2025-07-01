import React, { useMemo } from 'react';
// --- FIX 1: Import useNavigate ---
import { useNavigate } from 'react-router-dom';

// --- Helper & Placeholder Components ---
const LoadingSpinner = ({ text = "Loading..." }) => <div role="status" className="text-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div><p className="mt-4 text-slate-600 font-semibold">{text}</p></div>;
const UsersPlaceholderIcon = () => ( <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl sm:text-4xl text-slate-400" role="img" aria-label="no players icon">👥</div> );


// --- Main Leaderboard Component ---
const Leaderboard = ({ players = [], user, loading, isManagingCoachForThisClub }) => {
    // --- FIX 2: Initialize the navigate hook ---
    const navigate = useNavigate();

    // --- FIX 3: Update the click handler to navigate ---
    const handlePlayerClick = (player) => {
        // This will navigate to a URL like "/player/60d21b4667d0d8992e610c85"
        navigate(`/player/${player._id}`);
    };

    const sortedPlayers = useMemo(() => {
        if (!players) return [];
        return players
            .map(p => ({ ...p, score: typeof p.score === 'number' ? p.score : 0 }))
            .sort((a, b) => b.score - a.score)
            .map((player, index) => ({ ...player, rank: index + 1 }));
    }, [players]);

    const currentUserDataInRoster = useMemo(() => {
        if (!user || sortedPlayers.length === 0) return null;
        return sortedPlayers.find(p => p._id === user._id) || null;
    }, [user, sortedPlayers]);

    const topThree = useMemo(() => sortedPlayers.slice(0, 3), [sortedPlayers]);
    const otherPlayers = useMemo(() => sortedPlayers.slice(3), [sortedPlayers]);
    
    // Reorder for visual flexbox layout: [Rank 2, Rank 1, Rank 3]
    const podiumOrder = topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;
    
    // --- RENDER LOGIC ---

    if (loading && players.length === 0) {
        return <LoadingSpinner text="Loading Leaderboard..." />;
    }

    if (!loading && players.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 p-8 mt-6">
                <UsersPlaceholderIcon />
                <p className="text-lg font-medium text-slate-600 mt-2">No players on the leaderboard.</p>
                {isManagingCoachForThisClub && <p className="mt-1 text-sm text-slate-500">Add players to get started.</p>}
            </div>
        );
    }
    
    return (
        <section className="bg-slate-100 font-sans">
            {/* === Podium Section Wrapper === */}
            <div className="bg-[#F1F5F9] rounded-b-3xl pt-8 pb-4">
                <div className="max-w-4xl mx-auto px-4">

                    {/* --- MOBILE PODIUM (`md:hidden`) --- */}
                    <div className="flex justify-around items-end md:hidden space-x-1 sm:space-x-2">
                        {podiumOrder.map((player) => {
                            const mobilePodiumStyles = {
                                1: { pillarBg: 'bg-[#252A40]', badgeBorder: 'border-[#252A40]', pillarHeight: 'h-40', avatarSize: 'w-24 h-24', avatarBorder: 'border-cyan-400', badgeBg: 'bg-cyan-400', pointsColor: 'text-cyan-400', nameSize: 'text-base', scoreSize: 'text-xl' },
                                2: { pillarBg: 'bg-[#202020]', badgeBorder: 'border-[#202020]', pillarHeight: 'h-28', avatarSize: 'w-20 h-20', avatarBorder: 'border-amber-400', badgeBg: 'bg-amber-400', pointsColor: 'text-amber-400', nameSize: 'text-sm', scoreSize: 'text-lg' },
                                3: { pillarBg: 'bg-[#202020]', badgeBorder: 'border-[#202020]', pillarHeight: 'h-28', avatarSize: 'w-20 h-20', avatarBorder: 'border-green-400', badgeBg: 'bg-green-400', pointsColor: 'text-green-400', nameSize: 'text-sm', scoreSize: 'text-lg' },
                            };
                            const style = mobilePodiumStyles[player.rank];

                            return (
                                <div key={player.rank} className="w-1/3 flex flex-col items-center cursor-pointer" onClick={() => handlePlayerClick(player)}>
                                    <div className="relative">
                                        <img className={`rounded-full border-4 object-cover ${style.avatarSize} ${style.avatarBorder}`} src={player.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=4A5568&color=fff`} alt={player.name}/>
                                        <div className="absolute -bottom-2 w-full flex justify-center"><div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold border-2 ${style.badgeBorder} ${style.badgeBg}`}>{player.rank}</div></div>
                                    </div>
                                    <div className={`rounded-t-lg w-full mt-[-24px] pt-8 pb-2 text-center flex flex-col justify-end items-center ${style.pillarHeight} ${style.pillarBg}`}>
                                        <div className="flex-grow flex flex-col justify-end items-center"><h3 className={`text-white font-semibold truncate w-full px-1 ${style.nameSize}`}>{player.name}</h3><p className={`font-bold ${style.pointsColor} ${style.scoreSize}`}>{player.score.toLocaleString()}</p><p className="text-xs text-slate-400 -mt-1">points</p></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                    {/* --- DESKTOP PODIUM (`hidden md:flex`) --- */}
                    <div className="hidden md:flex justify-center items-end gap-x-0">
                        {/* Rank 2 Pillar */}
                        <div className="w-1/3 flex flex-col items-center cursor-pointer" onClick={() => topThree[1] && handlePlayerClick(topThree[1])}>
                            {topThree[1] && (
                                <>
                                    <div className="relative z-10">
                                        <img className="w-32 h-32 rounded-full border-4 border-amber-400 object-cover" src={topThree[1].imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[1].name)}&background=FBBF24&color=fff`} alt={topThree[1].name} />
                                        <div className="absolute -bottom-2 w-full flex justify-center"><div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white text-xl font-bold border-2 border-[#202020]">2</div></div>
                                    </div>
                                    <div className="bg-[#202020] rounded-l-2xl w-full h-72 -mt-16 pt-20 pb-4 flex flex-col items-center">
                                        <h3 className="text-white font-semibold text-lg truncate mt-4">{topThree[1].name}</h3>
                                        <p className="text-amber-400 font-bold text-2xl">{topThree[1].score.toLocaleString()}</p>
                                        <p className="text-xs text-slate-400 -mt-1">points</p>
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Rank 1 Pillar */}
                        <div className="w-1/3 flex flex-col items-center cursor-pointer" onClick={() => topThree[0] && handlePlayerClick(topThree[0])}>
                             {topThree[0] && (
                                <>
                                    <div className="relative z-10">
                                        <img className="w-40 h-40 rounded-full border-[6px] border-cyan-400 object-cover" src={topThree[0].imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[0].name)}&background=22D3EE&color=fff`} alt={topThree[0].name} />
                                        <div className="absolute -bottom-2 w-full flex justify-center"><div className="w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center text-white text-2xl font-bold border-4 border-[#252A40]">1</div></div>
                                    </div>
                                    <div className="bg-[#252A40] rounded-t-2xl w-full h-96 -mt-20 pt-24 pb-6 flex flex-col items-center">
                                        <h3 className="text-white font-semibold text-xl truncate mt-4">{topThree[0].name}</h3>
                                        <p className="text-cyan-400 font-bold text-3xl">{topThree[0].score.toLocaleString()}</p>
                                        <p className="text-xs text-slate-400 -mt-1">points</p>
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Rank 3 Pillar */}
                        <div className="w-1/3 flex flex-col items-center cursor-pointer" onClick={() => topThree[2] && handlePlayerClick(topThree[2])}>
                            {topThree[2] && (
                                <>
                                    <div className="relative z-10">
                                        <img className="w-32 h-32 rounded-full border-4 border-green-400 object-cover" src={topThree[2].imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[2].name)}&background=4ADE80&color=fff`} alt={topThree[2].name} />
                                        <div className="absolute -bottom-2 w-full flex justify-center"><div className="w-9 h-9 rounded-full bg-green-400 flex items-center justify-center text-white text-lg font-bold border-2 border-[#202020]">3</div></div>
                                    </div>
                                    <div className="bg-[#202020] rounded-r-2xl w-full h-72 -mt-14 pt-16 pb-4 flex flex-col items-center">
                                        <h3 className="text-white font-semibold text-lg truncate mt-4">{topThree[2].name}</h3>
                                        <p className="text-green-400 font-bold text-2xl">{topThree[2].score.toLocaleString()}</p>
                                        <p className="text-xs text-slate-400 -mt-1">points</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                {/* --- Current User Bar --- */}
                {currentUserDataInRoster && (
                    <div className="cursor-pointer mx-2 sm:mx-0 mt-4" onClick={() => handlePlayerClick(currentUserDataInRoster)}>
                        <div className="flex items-center justify-between bg-indigo-500 text-white p-3 rounded-xl shadow-lg">
                            <div className="flex items-center min-w-0">
                                <p className="font-bold text-base w-12 text-center">#{currentUserDataInRoster.rank}</p>
                                <img className="w-10 h-10 rounded-full object-cover ml-2 border-2 border-indigo-400" src={currentUserDataInRoster.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserDataInRoster.name)}&background=818CF8&color=fff`} alt={currentUserDataInRoster.name} />
                                <p className="font-semibold ml-3 truncate">{currentUserDataInRoster.name}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <p className="font-bold text-base">{currentUserDataInRoster.score.toLocaleString()}</p>
                                <p className="text-indigo-200 text-xs mt-[-2px]">points</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Rest of the Leaderboard List --- */}
                <div className="space-y-3 px-2 sm:px-0 pt-4 pb-10">
                    {otherPlayers.map((player) => (
                        <div key={player.rank} className="cursor-pointer" onClick={() => handlePlayerClick(player)}>
                            <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                                <div className="flex items-center min-w-0">
                                    <p className="font-bold text-slate-500 text-base w-12 text-center">#{player.rank}</p>
                                    <img className="w-10 h-10 rounded-full object-cover ml-2" src={player.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=E2E8F0&color=64748B`} alt={player.name} />
                                    <div className="ml-3">
                                        <p className="font-semibold text-slate-800 truncate">{player.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{player.email || "Email not provided"}</p>
                                        <p className="text-xs text-slate-500 truncate">{player.phone || "Phone not provided"}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className="font-bold text-indigo-600 text-base">{player.score.toLocaleString()}</p>
                                    <p className="text-slate-500 text-xs mt-[-2px]">points</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Leaderboard;