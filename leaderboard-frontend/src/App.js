import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, Trophy, Sparkles, UserPlus } from 'lucide-react';

// Base URL backend API
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://leaderboard-backend-ripd.onrender.com' 
    : 'http://localhost:5000/api';

const App = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [pointsClaimed, setPointsClaimed] = useState(null);
    const [newUserName, setNewUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Function to show custom modal messages
    const showCustomModal = (message) => {
        setModalMessage(message);
        setShowModal(true);
    };

    // Function to fetch users from the backend
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // The backend is already sorting and assigning ranks, so we just set the data
            setUsers(data);

            // Set initial selected user if none is selected and users exist
            if (!selectedUserId && data.length > 0) {
                setSelectedUserId(data[0]._id);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load users. Please ensure the backend server is running.");
            // Fallback for initial users if backend is not running (for demo purposes)
            if (users.length === 0) {
                setUsers([
                    { _id: 'user1', name: 'Rahul', totalPoints: 100, rank: 1 },
                    { _id: 'user2', name: 'Kamal', totalPoints: 90, rank: 2 },
                    { _id: 'user3', name: 'Sanak', totalPoints: 80, rank: 3 },
                    { _id: 'user4', name: 'Priya', totalPoints: 70, rank: 4 },
                    { _id: 'user5', name: 'Amit', totalPoints: 60, rank: 5 },
                    { _id: 'user6', name: 'Deepa', totalPoints: 50, rank: 6 },
                    { _id: 'user7', name: 'Vikas', totalPoints: 40, rank: 7 },
                    { _id: 'user8', name: 'Swati', totalPoints: 30, rank: 8 },
                    { _id: 'user9', name: 'Rohan', totalPoints: 20, rank: 9 },
                    { _id: 'user10', name: 'Anjali', totalPoints: 10, rank: 10 },
                ]);
                setSelectedUserId('user1');
                showCustomModal("Backend not reachable. Displaying dummy data. Please run your Node.js backend.");
            }
        } finally {
            setLoading(false);
        }
    }, [selectedUserId, users.length]); // Added users.length to dependency to re-run if initial users are set

    // Fetch users on component mount and periodically (simulating real-time updates)
    useEffect(() => {
        fetchUsers();
        // Set up a polling interval to simulate real-time updates from the backend
        const interval = setInterval(fetchUsers, 5000); // Poll every 5 seconds
        return () => clearInterval(interval); // Clean up on unmount
    }, [fetchUsers]);

    // Handle claiming points for a selected user
    const handleClaimPoints = async () => {
        if (!selectedUserId) {
            showCustomModal("Please select a user first.");
            return;
        }

        setError('');
        setPointsClaimed(null); // Clear previous points claimed display

        try {
            const response = await fetch(`${API_BASE_URL}/users/${selectedUserId}/claim-points`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Body can be empty as backend generates points and uses userId from params
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setPointsClaimed(data.pointsClaimed);
            showCustomModal(`${data.user.name} claimed ${data.pointsClaimed} points!`);
            fetchUsers(); // Re-fetch users to update leaderboard immediately
        } catch (err) {
            console.error("Error claiming points:", err);
            setError("Failed to claim points. Ensure backend is running and user exists.");
        }
    };

    // Handle adding a new user
    const handleAddUser = async () => {
        if (!newUserName.trim()) {
            showCustomModal("Please enter a user name.");
            return;
        }

        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newUserName.trim() }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newUser = await response.json();
            setNewUserName('');
            showCustomModal(`${newUser.name} added successfully!`);
            fetchUsers(); // Re-fetch users to update leaderboard
        } catch (err) {
            console.error("Error adding new user:", err);
            setError("Failed to add new user. Ensure backend is running.");
        }
    };

    // Separate the top 3 users for distinct display(at top)
    const topThreeUsers = users.slice(0, 3);
    const remainingUsers = users.slice(3);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 font-inter text-gray-800">
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-sm w-full transform transition-all duration-300 scale-100 opacity-100">
                        <p className="text-lg font-semibold mb-5 text-gray-700">{modalMessage}</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="bg-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            Got It!
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-purple-200">
                <h1 className="text-5xl font-extrabold text-center text-purple-800 mb-8 tracking-tight leading-tight">
                    <Trophy className="inline-block w-10 h-10 mr-3 text-yellow-500" />
                    Leaderboard
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative mb-8 shadow-md" role="alert">
                        <span className="block sm:inline font-medium">{error}</span>
                    </div>
                )}

             
                <div className="bg-purple-50 p-6 rounded-2xl shadow-inner mb-10 border border-purple-100">
                    <h2 className="text-2xl font-bold text-purple-700 mb-5 flex items-center">
                        <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
                        Claim Your Points!
                    </h2>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:w-3/5">
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="appearance-none w-full p-4 pr-10 border border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 bg-white text-gray-700 shadow-sm text-lg font-medium cursor-pointer"
                            >
                                <option value="" disabled>Select a user to claim points</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id}>
                                        {user.name} ({user.totalPoints} pts)
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none" />
                        </div>
                        <button
                            onClick={handleClaimPoints}
                            disabled={loading || !selectedUserId}
                            className="w-full md:w-2/5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 font-bold text-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-6 h-6 mr-2" />
                            Claim Points
                        </button>
                    </div>
                    {pointsClaimed !== null && (
                        <p className="text-center text-green-700 font-bold text-2xl mt-6 animate-bounce">
                            🎉 +{pointsClaimed} Points Awarded! 🎉
                        </p>
                    )}
                </div>

             
                <div className="bg-blue-50 p-6 rounded-2xl shadow-inner mb-10 border border-blue-100">
                    <h2 className="text-2xl font-bold text-blue-700 mb-5 flex items-center">
                        <UserPlus className="w-6 h-6 mr-2 text-blue-500" />
                        Add New Player
                    </h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Enter new player name"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            className="flex-grow p-4 border border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 bg-white text-gray-700 shadow-sm text-lg font-medium"
                        />
                        <button
                            onClick={handleAddUser}
                            disabled={loading || !newUserName.trim()}
                            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 font-bold text-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-6 h-6 mr-2" />
                            Add Player
                        </button>
                    </div>
                </div>

                
                <div className="bg-gray-50 p-6 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-3xl font-bold text-center text-purple-800 mb-8">
                        Top Players
                    </h2>
                    {loading ? (
                        <p className="text-center text-lg text-gray-600 animate-pulse">Loading rankings...</p>
                    ) : users.length === 0 ? (
                        <p className="text-center text-lg text-gray-600">No players yet. Add some to see the leaderboard!</p>
                    ) : (
                        <>
                            {/* Top 3 Section */}
                            <div className="flex justify-around items-end mb-10 gap-4 flex-wrap">
                                {topThreeUsers[1] && ( // Second place
                                    <div className="flex flex-col items-center text-center p-4">
                                        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-gray-300 flex items-center justify-center text-white text-5xl font-bold border-4 border-gray-400 shadow-lg mb-2 overflow-hidden">
                                            {/* Placeholder for avatar, replace with actual image if available */}
                                            <img src={`https://placehold.co/128x128/bdbdbd/ffffff?text=${topThreeUsers[1].name.charAt(0)}`} alt={topThreeUsers[1].name} className="w-full h-full object-cover" />
                                            <span className="absolute bottom-0 right-0 bg-gray-600 text-white text-sm px-2 py-1 rounded-tl-lg font-semibold">#2</span>
                                        </div>
                                        <p className="text-xl font-semibold text-gray-700">{topThreeUsers[1].name}</p>
                                        <p className="text-lg font-bold text-gray-600">{topThreeUsers[1].totalPoints} pts</p>
                                    </div>
                                )}
                                {topThreeUsers[0] && ( // First place
                                    <div className="flex flex-col items-center text-center p-4 -mt-8">
                                        <div className="relative w-36 h-36 md:w-40 md:h-40 rounded-full bg-yellow-300 flex items-center justify-center text-white text-6xl font-bold border-4 border-yellow-500 shadow-xl mb-2 overflow-hidden">
                                            <img src={`https://placehold.co/160x160/FFD700/ffffff?text=${topThreeUsers[0].name.charAt(0)}`} alt={topThreeUsers[0].name} className="w-full h-full object-cover" />
                                            <Trophy className="absolute top-2 right-2 w-8 h-8 text-yellow-700" />
                                            <span className="absolute bottom-0 right-0 bg-yellow-600 text-white text-sm px-2 py-1 rounded-tl-lg font-semibold">#1</span>
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-700">{topThreeUsers[0].name}</p>
                                        <p className="text-xl font-bold text-yellow-600">{topThreeUsers[0].totalPoints} pts</p>
                                    </div>
                                )}
                                {topThreeUsers[2] && ( // Third place
                                    <div className="flex flex-col items-center text-center p-4">
                                        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-orange-300 flex items-center justify-center text-white text-5xl font-bold border-4 border-orange-400 shadow-lg mb-2 overflow-hidden">
                                            <img src={`https://placehold.co/128x128/FF8C00/ffffff?text=${topThreeUsers[2].name.charAt(0)}`} alt={topThreeUsers[2].name} className="w-full h-full object-cover" />
                                            <span className="absolute bottom-0 right-0 bg-orange-600 text-white text-sm px-2 py-1 rounded-tl-lg font-semibold">#3</span>
                                        </div>
                                        <p className="text-xl font-semibold text-orange-700">{topThreeUsers[2].name}</p>
                                        <p className="text-lg font-bold text-orange-600">{topThreeUsers[2].totalPoints} pts</p>
                                    </div>
                                )}
                            </div>

                            {/* Remaining Users List */}
                            <ul className="space-y-3">
                                {remainingUsers.map((user) => (
                                    <li
                                        key={user._id}
                                        className="flex items-center p-4 rounded-xl shadow-sm bg-white border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-purple-300"
                                    >
                                        <span className="font-extrabold text-2xl mr-4 w-10 text-center text-purple-600">
                                            {user.rank}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-lg mr-4 overflow-hidden">
                                            {/* Placeholder for avatar */}
                                            <img src={`https://placehold.co/40x40/e9d5ff/6d28d9?text=${user.name.charAt(0)}`} alt={user.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="flex-grow text-gray-800 font-semibold text-lg">
                                            {user.name}
                                        </span>
                                        <span className="text-purple-700 font-bold text-xl">
                                            {user.totalPoints} pts
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
