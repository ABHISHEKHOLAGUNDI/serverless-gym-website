import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, History, ChevronDown, ChevronUp, ArrowLeft, Ruler, Weight } from 'lucide-react';
import { useGymContext } from '../context/GymContext';

const Measurements = () => {
    const { members } = useGymContext();
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    React.useEffect(() => {
        if (selectedMember) {
            fetch(`/api/measurements?member_id=${selectedMember.id}&v=${Date.now()}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setSelectedMember(prev => ({ ...prev, measurements: data }));
                    }
                })
                .catch(err => console.error("Failed to fetch measurements", err));
        }
    }, [selectedMember?.id]);

    const [newEntry, setNewEntry] = useState({
        date: new Date().toISOString().split('T')[0],
        weight: '', chest: '', bicepsL: '', bicepsR: '', waist: '', thigh: '', calves: ''
    });

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedMember) return;

        try {
            const payload = { member_id: selectedMember.id, ...newEntry };
            const res = await fetch('/api/measurements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSelectedMember(prev => ({
                    ...prev,
                    measurements: [newEntry, ...(prev.measurements || [])]
                }));
                setIsFormOpen(false);
                setNewEntry({ date: new Date().toISOString().split('T')[0], weight: '', chest: '', bicepsL: '', bicepsR: '', waist: '', thigh: '', calves: '' });
                alert("Measurements saved successfully!");
            } else {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to save");
            }
        } catch (err) {
            console.error(err);
            alert(`Failed to save measurements: ${err.message}`);
        }
    };

    const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            <div>
                <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase">Measurements</h1>
                <div className="h-0.5 w-12 bg-gradient-to-r from-gold-400 to-transparent rounded-full mt-1"></div>
            </div>

            {!selectedMember ? (
                /* Member Selector */
                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="text-gray-600 group-focus-within:text-gold-400 transition-colors" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search member to view/add..."
                            className="cosmic-input pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        {filteredMembers.map((member, index) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => setSelectedMember(member)}
                                className="glass-card p-4 flex justify-between items-center cursor-pointer group border-l-2 border-l-gold-500/30 hover:border-l-gold-500/60 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-gold-500/15 to-transparent border border-gold-400/20 rounded-xl flex items-center justify-center text-gold-400 font-bold text-sm font-display">
                                        {member.name.charAt(0)}
                                    </div>
                                    <span className="font-tech font-semibold text-gray-300 group-hover:text-gold-400 transition-colors tracking-wider">{member.name}</span>
                                </div>
                                <span className="text-xs bg-gold-500/10 text-gold-500 px-2.5 py-1 rounded-md font-tech border border-gold-500/20">ID: {member.id}</span>
                            </motion.div>
                        ))}
                        {filteredMembers.length === 0 && (
                            <div className="empty-state">
                                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                                    <Ruler className="w-14 h-14 mx-auto mb-3 text-gold-500/30" />
                                </motion.div>
                                <p className="text-gray-500 font-tech tracking-wider">No members found</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Selected Member View */
                <div className="space-y-6">
                    {/* Member Header */}
                    <div className="glass-card p-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold-400/40 to-transparent"></div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-gradient-to-br from-gold-500/20 to-amber-600/10 border border-gold-400/25 rounded-xl flex items-center justify-center text-gold-400 font-bold text-lg font-display shadow-[0_0_15px_rgba(184,151,42,0.1)]">
                                    {selectedMember.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-display font-bold text-gold-400 tracking-wider">{selectedMember.name}</h2>
                                    <p className="text-gray-500 text-xs font-tech">Height: {selectedMember.height || 'N/A'} cm</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-tech text-gray-400 hover:text-white transition-all"
                            >
                                <ArrowLeft size={14} /> Change
                            </button>
                        </div>
                    </div>

                    {/* Add New Button */}
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="w-full py-3.5 glass-card text-gold-400 font-tech font-semibold flex items-center justify-center gap-2 transition-all tracking-wider hover:border-gold-400/40"
                    >
                        {isFormOpen ? <ChevronUp size={20} /> : <Plus size={20} />}
                        {isFormOpen ? 'Cancel Entry' : '+ Add New Measurements'}
                    </button>

                    {/* Entry Form */}
                    <AnimatePresence>
                        {isFormOpen && (
                            <motion.form
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                onSubmit={handleSave}
                                className="glass-panel p-5 rounded-2xl overflow-hidden"
                            >
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <label className="cosmic-label">Date</label>
                                        <input type="date" required value={newEntry.date}
                                            onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                                            className="cosmic-input" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Weight (kg) *', key: 'weight' },
                                            { label: 'Chest (in) *', key: 'chest' },
                                            { label: 'L. Biceps (in) *', key: 'bicepsL' },
                                            { label: 'R. Biceps (in) *', key: 'bicepsR' },
                                        ].map(f => (
                                            <div key={f.key}>
                                                <label className="cosmic-label">{f.label}</label>
                                                <input type="number" required placeholder="0.0"
                                                    className="cosmic-input"
                                                    value={newEntry[f.key]}
                                                    onChange={e => setNewEntry({ ...newEntry, [f.key]: e.target.value })} />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gold-400/10 my-2"></div>
                                    <p className="text-[10px] font-tech text-gray-600 uppercase tracking-widest">Optional Measurements</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { p: 'Waist', k: 'waist' },
                                            { p: 'Thigh', k: 'thigh' },
                                            { p: 'Calves', k: 'calves' },
                                        ].map(f => (
                                            <input key={f.k} type="number" placeholder={f.p}
                                                className="cosmic-input text-sm py-2.5"
                                                value={newEntry[f.k]}
                                                onChange={e => setNewEntry({ ...newEntry, [f.k]: e.target.value })} />
                                        ))}
                                    </div>

                                    <button type="submit" className="cosmic-btn w-full justify-center">
                                        Save Measurements
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* History */}
                    <div className="space-y-3">
                        <h3 className="font-display font-bold text-gold-400 tracking-widest uppercase flex items-center gap-2 text-sm">
                            <History size={16} /> History
                        </h3>
                        {!selectedMember.measurements || selectedMember.measurements.length === 0 ? (
                            <div className="empty-state">
                                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                                    <Weight className="w-12 h-12 text-gold-500/30" />
                                </motion.div>
                                <p className="text-gray-500 font-tech tracking-wider mt-2 text-sm">No measurements recorded yet</p>
                            </div>
                        ) : (
                            selectedMember.measurements.map((entry, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="glass-card p-4 border-l-2 border-l-gold-500/30"
                                >
                                    <div className="flex justify-between items-end mb-3 border-b border-gold-400/10 pb-2">
                                        <span className="text-sm text-gray-500 font-tech">{new Date(entry.date).toLocaleDateString('en-GB')}</span>
                                        <span className="text-xl font-display font-bold text-gold-400">
                                            {entry.weight} <span className="text-xs font-tech text-gray-500">kg</span>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div className="bg-[#050816]/60 border border-white/5 rounded-xl p-2">
                                            <div className="text-[10px] text-gray-600 uppercase font-tech">Chest</div>
                                            <div className="font-semibold text-sm text-gray-300">{entry.chest}"</div>
                                        </div>
                                        <div className="bg-[#050816]/60 border border-white/5 rounded-xl p-2">
                                            <div className="text-[10px] text-gray-600 uppercase font-tech">Arms</div>
                                            <div className="font-semibold text-sm text-gray-300">{entry.bicepsL}" / {entry.bicepsR}"</div>
                                        </div>
                                        {entry.waist && (
                                            <div className="bg-[#050816]/60 border border-white/5 rounded-xl p-2">
                                                <div className="text-[10px] text-gray-600 uppercase font-tech">Waist</div>
                                                <div className="font-semibold text-sm text-gray-300">{entry.waist}"</div>
                                            </div>
                                        )}
                                        {entry.thigh && (
                                            <div className="bg-[#050816]/60 border border-white/5 rounded-xl p-2">
                                                <div className="text-[10px] text-gray-600 uppercase font-tech">Thigh</div>
                                                <div className="font-semibold text-sm text-gray-300">{entry.thigh}"</div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Measurements;
