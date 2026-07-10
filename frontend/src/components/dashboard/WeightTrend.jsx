import  { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const WeightTrend = ({ currentDate }) => {
    const [weightData, setWeightData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [weightInput, setWeightInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchWeightHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:3333/dashboard/weight-history', {
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to fetch weight history');

            const data = await response.json();

            const formatted = data.map(entry => ({
                ...entry,
                displayDate: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            }));

            setWeightData(formatted);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeightHistory();
    }, []);

    const handleLogWeight = async (e) => {
        e.preventDefault();
        if (!weightInput) return;

        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:3333/dashboard/weight', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    date: currentDate,
                    weight: Number(weightInput),
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to log weight');
            }

            setWeightInput('');
            await fetchWeightHistory();
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const weights = weightData.map(d => d.weight);
    const minWeight = weights.length ? Math.min(...weights) : 0;
    const maxWeight = weights.length ? Math.max(...weights) : 0;
    const padding = Math.max((maxWeight - minWeight) * 0.15, 1);

    return (
        <div className="h-full bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-gray-900">Weight Trend</h3>

                <form onSubmit={handleLogWeight} className="flex gap-2">
                    <input
                        type="number"
                        step="0.1"
                        placeholder="Log weight (kg)"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-36 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Log'}
                    </button>
                </form>
            </div>

            <div className="flex-1 min-h-0">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        Loading weight trend...
                    </div>
                ) : error ? (
                    <div className="h-full flex items-center justify-center text-red-600 text-sm text-center px-4">
                        {error}
                    </div>
                ) : weightData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center px-4">
                        No weight entries logged yet. Log your weight above to start the trend.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                            <XAxis
                                dataKey="displayDate"
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                domain={[minWeight - padding, maxWeight + padding]}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                width={40}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px' }}
                                formatter={(value) => [`${value} kg`, 'Weight']}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#4F46E5"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#4F46E5' }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default WeightTrend;