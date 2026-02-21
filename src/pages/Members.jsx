import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Phone, MoreVertical, Edit, Trash, Download, RefreshCw, X, MessageCircle, Cake, Users, Dumbbell, UtensilsCrossed } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useGymContext } from '../context/GymContext';
import { useLocation } from 'react-router-dom';
import WorkoutAssignModal from '../components/WorkoutAssignModal';
import DietAssignModal from '../components/DietAssignModal';

const Members = () => {
    const { members, trainers, addMember, updateMember, deleteMember, renewMember } = useGymContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [members, setMembers] = useState(DUMMY_MEMBERS); // Removed local state
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [editMode, setEditMode] = useState(false); // false | 'edit' | 'renew'
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [workoutMember, setWorkoutMember] = useState(null);
    const [dietMember, setDietMember] = useState(null);

    // Filter Logic
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const filterParam = queryParams.get('filter');

    const getFilteredMembers = () => {
        let filtered = members;

        // Apply URL Filters
        if (filterParam === 'active') {
            filtered = filtered.filter(m => m.status === 'Active');
        } else if (filterParam === 'expired') {
            filtered = filtered.filter(m => new Date(m.expiry) < new Date());
        } else if (filterParam === 'expiring_soon') {
            filtered = filtered.filter(m => {
                const diff = (new Date(m.expiry) - new Date()) / (1000 * 60 * 60 * 24);
                return diff > 0 && diff <= 3;
            });
        } else if (filterParam === 'expiring_week') {
            filtered = filtered.filter(m => {
                const diff = (new Date(m.expiry) - new Date()) / (1000 * 60 * 60 * 24);
                return diff > 3 && diff <= 7;
            });
        } else if (filterParam === 'expiring_15') {
            filtered = filtered.filter(m => {
                const diff = (new Date(m.expiry) - new Date()) / (1000 * 60 * 60 * 24);
                return diff > 7 && diff <= 15;
            });
        } else if (filterParam === 'due') {
            filtered = filtered.filter(m => parseInt(m.amount) > 0);
        } else if (filterParam === 'birthday') {
            const today = new Date();
            const todayMonth = today.getMonth() + 1;
            const todayDate = today.getDate();
            filtered = filtered.filter(m => {
                if (!m.dob) return false;
                const [y, mth, d] = m.dob.split('-').map(Number);
                return mth === todayMonth && d === todayDate;
            });
        }

        // Apply Search
        if (searchTerm) {
            filtered = filtered.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm));
        }
        return filtered;
    };

    const finalMembers = getFilteredMembers();

    const [newMember, setNewMember] = useState({
        name: '',
        phone: '',
        dob: '',
        height: '',
        photo: null,
        planType: 'Monthly',
        amount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Active'
    });

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // ... (Auto-calculate End Date and Photo Upload handlers remain same) ...
    // Auto-calculate End Date when start date or plan type changes
    useEffect(() => {
        if (isModalOpen && newMember.startDate && newMember.planType) {
            const start = new Date(newMember.startDate);
            let end = new Date(start);
            if (newMember.planType === 'Monthly') end.setMonth(end.getMonth() + 1);
            else if (newMember.planType === 'Quarterly') end.setMonth(end.getMonth() + 3);
            else if (newMember.planType === 'Yearly') end.setFullYear(end.getFullYear() + 1);

            setNewMember(prev => ({ ...prev, endDate: end.toISOString().split('T')[0] }));
        }
    }, [newMember.startDate, newMember.planType, isModalOpen]);

    // Compress photo to 200x200 JPEG 60% quality to stay under D1's 100KB limit
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 200;
            let w = img.width, h = img.height;
            if (w > h) { h = (h / w) * MAX_SIZE; w = MAX_SIZE; }
            else { w = (w / h) * MAX_SIZE; h = MAX_SIZE; }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.6);
            setNewMember(prev => ({ ...prev, photo: compressed }));
        };
        img.src = URL.createObjectURL(file);
    };

    // Helper: compute end date from start + plan type
    const calcEndDate = (startDate, planType) => {
        if (!startDate || !planType) return '';
        const start = new Date(startDate);
        let end = new Date(start);
        if (planType === 'Monthly') end.setMonth(end.getMonth() + 1);
        else if (planType === 'Quarterly') end.setMonth(end.getMonth() + 3);
        else if (planType === 'Yearly') end.setFullYear(end.getFullYear() + 1);
        return end.toISOString().split('T')[0];
    };

    const handleOpenModal = (mode = false, member = null) => {
        setEditMode(mode);
        const today = new Date().toISOString().split('T')[0];
        if (mode === 'edit' && member) {
            setSelectedMemberId(member.id);
            const pt = member.planType || 'Monthly';
            setNewMember({
                name: member.name,
                phone: member.phone,
                dob: member.dob || '',
                height: member.height || '',
                photo: member.photo,
                planType: pt,
                amount: member.amount || '',
                startDate: member.startDate || today,
                endDate: member.expiry || calcEndDate(member.startDate || today, pt),
                trainerId: member.trainerId || '',
                status: member.status
            });
        } else if (mode === 'renew' && member) {
            setSelectedMemberId(member.id);
            setNewMember({
                name: member.name,
                phone: member.phone,
                dob: member.dob || '',
                height: member.height || '',
                photo: member.photo,
                planType: 'Monthly',
                amount: '',
                startDate: today,
                endDate: calcEndDate(today, 'Monthly'),
                trainerId: member.trainerId || '',
                status: 'Active'
            });
        } else {
            // New Member
            setSelectedMemberId(null);
            setNewMember({
                name: '',
                phone: '',
                dob: '',
                height: '',
                photo: null,
                planType: 'Monthly',
                amount: '',
                startDate: today,
                endDate: calcEndDate(today, 'Monthly'),
                trainerId: '',
                status: 'Active'
            });
        }
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const handleSubmit = async (e) => {
        // ... (Submit logic remains same, relies on actions) ...
        e.preventDefault();

        if (editMode === 'edit') {
            updateMember({
                id: selectedMemberId,
                ...newMember,
                expiry: newMember.endDate // Persist expiry
            });
        } else if (editMode === 'renew') {
            renewMember(selectedMemberId, newMember.endDate, newMember.amount, newMember.planType);
            const renewedMember = members.find(m => m.id === selectedMemberId);
            if (window.confirm("Membership Renewed! Generate Invoice?")) {
                setTimeout(() => generateInvoice({ ...renewedMember, amount: newMember.amount, planType: newMember.planType, expiry: newMember.endDate }), 100);
            }
        } else {
            // Add New
            const memberToAdd = {
                id: Date.now(),
                ...newMember,
                expiry: newMember.endDate
            };
            addMember(memberToAdd);
            if (window.confirm("Member Added! Generate and Download Invoice?")) {
                setTimeout(() => generateInvoice(memberToAdd), 100);
            }
        }

        setIsModalOpen(false);
        setNewMember({
            name: '', phone: '', height: '', photo: null, planType: 'Monthly', amount: '',
            startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'Active'
        });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this member?")) {
            deleteMember(id);
        }
        setActiveMenuId(null);
    };

    const sendExpiryReminder = (member) => {
        const message = `Hi ${member.name}, your gym membership is expiring on ${formatDate(member.expiry)}. Please renew soon to avoid interruption!`;
        const waUrl = `https://wa.me/91${member.phone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    const sendBirthdayWish = (member) => {
        const message = `Happy Birthday ${member.name}! 🎂🎉 Have a fantastic day filled with joy and gains! - From Gym Team`;
        const waUrl = `https://wa.me/91${member.phone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    // ... (generateInvoice remains same) ...
    const generateInvoice = async (member) => {
        // ... (existing code) ...
        try {
            setInvoiceData(member);

            // Wait for render loop (max 2s)
            let invoiceElement = null;
            for (let i = 0; i < 20; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                invoiceElement = document.getElementById('invoice-template');
                if (invoiceElement) break;
            }

            if (!invoiceElement) {
                throw new Error("Invoice template not found in DOM after waiting.");
            }

            // Ensure text is visibly 'black' to the renderer
            invoiceElement.style.color = '#000000';

            const canvas = await html2canvas(invoiceElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                windowWidth: invoiceElement.scrollWidth,
                windowHeight: invoiceElement.scrollHeight
            });

            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile && navigator.canShare && navigator.share) {
                canvas.toBlob(async (blob) => {
                    if (!blob) throw new Error("Canvas to Blob failed");
                    const file = new File([blob], `Invoice_${member.name.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
                    if (navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'Gym Invoice',
                                text: `Invoice for ${member.name}`
                            });
                        } catch (err) {
                            console.warn("Share failed", err);
                        }
                    } else {
                        throw new Error("Device does not support sharing this file type.");
                    }
                }, 'image/png');
            } else {
                // Desktop
                const imageDataUrl = canvas.toDataURL("image/png");
                const link = document.createElement('a');
                link.href = imageDataUrl;
                link.download = `Invoice_${member.name.replace(/\s+/g, '_')}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Open WhatsApp
            setTimeout(() => {
                const message = `Hi ${member.name}, please find your invoice attached. Amount Paid: ₹${member.amount || ''}`;
                const waUrl = `https://wa.me/91${member.phone}?text=${encodeURIComponent(message)}`;
                window.open(waUrl, '_blank');
            }, 1000);

        } catch (error) {
            console.error("Invoice generation failed:", error);
            alert(`Error generating invoice: ${error.message}`);
        }
    };
    const [invoiceData, setInvoiceData] = useState(null);

    // Helper to format date as dd/mm/yyyy
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        return date.toLocaleDateString('en-GB'); // en-GB gives dd/mm/yyyy
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-24 px-3 space-y-4 pt-3 relative min-h-screen"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="page-title">Members</h1>
                        {filterParam && (
                            <button onClick={() => window.history.back()} className="text-[10px] bg-gold-500/10 border border-gold-400/20 px-2.5 py-0.5 rounded-full text-gold-400 font-tech tracking-wider hover:bg-gold-500/20 transition-colors">✕ Filter</button>
                        )}
                    </div>
                    <p className="page-subtitle">
                        {filterParam === 'expired' ? 'Expired Members' : filterParam === 'expiring_soon' ? 'Expiring Soon (1-3 Days)' : 'Manage your gym members'}
                    </p>
                    <div className="accent-line"></div>
                </div>
                <motion.button
                    onClick={() => handleOpenModal(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl relative overflow-hidden font-tech font-bold tracking-wider text-sm text-gold-400"
                    style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(217, 119, 6, 0.1))',
                        border: '1px solid rgba(251, 191, 36, 0.5)',
                        boxShadow: '0 0 20px rgba(251, 191, 36, 0.2), 0 0 40px rgba(251, 191, 36, 0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
                    }}
                >
                    <Plus size={18} strokeWidth={2.5} />
                    ADD
                </motion.button>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="text-gray-500 group-focus-within:text-gold-400 transition-colors duration-300" size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    className="cosmic-input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Members List */}
            <div className="space-y-3">
                {finalMembers.length > 0 ? (
                    finalMembers.map(member => {
                        const isExpiringSoon = (new Date(member.expiry) - new Date()) / (1000 * 60 * 60 * 24) <= 3 && (new Date(member.expiry) > new Date());
                        const isExpired = new Date(member.expiry) < new Date();

                        const isBirthday = (() => {
                            if (!member.dob) return false;
                            const today = new Date();
                            const [y, m, d] = member.dob.split('-').map(Number);
                            return m === today.getMonth() + 1 && d === today.getDate();
                        })();

                        return (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}
                                style={{ zIndex: activeMenuId === member.id ? 20 : 0 }}
                                className={`p-3.5 rounded-xl flex justify-between items-center border transition-all duration-300 relative ${isExpired
                                    ? 'bg-red-950/30 border-red-500/20 status-expired'
                                    : isExpiringSoon
                                        ? 'bg-amber-950/20 border-amber-500/20 status-warning'
                                        : 'bg-[#0c1220]/80 border-white/[0.06] hover:border-gold-400/25 status-active'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {member.photo ? (
                                        <img src={member.photo} alt={member.name} className="w-11 h-11 rounded-xl object-cover border border-gold-400/20 shadow-md" />
                                    ) : (
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm font-display border ${isExpired ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                            isExpiringSoon ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                'bg-emerald-500/8 border-emerald-500/15 text-emerald-400'
                                            }`}>
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h3 className="font-tech font-semibold text-white text-sm tracking-wider truncate">{member.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[11px] font-tech ${isExpired ? 'text-red-400' : 'text-gray-600'}`}>
                                                {formatDate(member.expiry)}
                                            </span>
                                            <span className={`text-[9px] uppercase font-bold tracking-[0.12em] px-1.5 py-0.5 rounded-md ${isExpired ? 'text-red-400 bg-red-500/10' :
                                                isExpiringSoon ? 'text-amber-400 bg-amber-500/10' :
                                                    'text-emerald-400 bg-emerald-500/8'
                                                }`}>
                                                {isExpired ? 'EXPIRED' : member.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-1.5 items-center relative">
                                    {isExpiringSoon && (
                                        <button
                                            onClick={() => sendExpiryReminder(member)}
                                            className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 border border-amber-500/15 transition-all"
                                            title="Send Expiry Reminder"
                                        >
                                            <MessageCircle size={16} />
                                        </button>
                                    )}

                                    {isBirthday && (
                                        <button
                                            onClick={() => sendBirthdayWish(member)}
                                            className="p-1.5 bg-pink-500/10 text-pink-400 rounded-lg hover:bg-pink-500/20 border border-pink-500/15 transition-all"
                                            title="Send Birthday Wish"
                                        >
                                            <Cake size={16} />
                                        </button>
                                    )}

                                    {isExpired && (
                                        <button
                                            onClick={() => handleOpenModal('renew', member)}
                                            className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 border border-emerald-500/15 transition-all"
                                            title="Renew Now"
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    )}

                                    {!isExpired && !isExpiringSoon && (
                                        <a
                                            href={`tel:${member.phone}`}
                                            className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 border border-emerald-500/15 transition-all"
                                        >
                                            <Phone size={16} />
                                        </a>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === member.id ? null : member.id);
                                        }}
                                        className="p-1.5 bg-white/[0.05] text-gray-500 rounded-lg hover:bg-white/[0.08] hover:text-gray-300 border border-white/[0.06] transition-all"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    <AnimatePresence>
                                        {activeMenuId === member.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                transition={{ duration: 0.15 }}
                                                className="right-0 top-11 w-48 glass-dropdown rounded-xl overflow-hidden py-1"
                                            >
                                                {[
                                                    { label: 'Invoice', icon: <Download size={14} />, color: 'text-blue-400', bg: 'bg-blue-500/10', action: () => generateInvoice({ ...member, amount: '0.00' }) },
                                                    { label: 'Edit', icon: <Edit size={14} />, color: 'text-amber-400', bg: 'bg-amber-500/10', action: () => handleOpenModal('edit', member) },
                                                    { label: 'Renew', icon: <RefreshCw size={14} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', action: () => handleOpenModal('renew', member) },
                                                    { label: 'Workout', icon: <Dumbbell size={14} />, color: 'text-purple-400', bg: 'bg-purple-500/10', action: () => { setWorkoutMember(member); setActiveMenuId(null); } },
                                                    { label: 'Diet', icon: <UtensilsCrossed size={14} />, color: 'text-orange-400', bg: 'bg-orange-500/10', action: () => { setDietMember(member); setActiveMenuId(null); } },
                                                ].map((item, i) => (
                                                    <button key={i} onClick={item.action} className="w-full text-left px-3 py-2.5 text-[13px] text-gray-400 hover:text-white hover:bg-white/[0.04] flex items-center gap-2.5 font-tech tracking-wider transition-all">
                                                        <div className={`w-7 h-7 rounded-lg ${item.bg} ${item.color} flex items-center justify-center`}>{item.icon}</div>
                                                        {item.label}
                                                    </button>
                                                ))}
                                                <div className="h-px bg-white/[0.05] my-1 mx-3"></div>
                                                <button onClick={() => handleDelete(member.id)} className="w-full text-left px-3 py-2.5 text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 font-tech tracking-wider transition-all">
                                                    <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center"><Trash size={14} /></div>
                                                    Delete
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <Users size={28} className="text-gold-400/70" />
                        </div>
                        <p className="empty-state-title">No members found</p>
                        <p className="empty-state-sub">Add your first member to get started</p>
                    </div>
                )}
            </div>

            {/* Add/Edit/Renew Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-md overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="glass-modal rounded-2xl my-auto"
                        >
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-white/[0.05]">
                                    <div>
                                        <h2 className="text-lg font-display font-bold text-gold-400 tracking-[0.1em] uppercase">
                                            {editMode === 'edit' ? 'Edit Member' : editMode === 'renew' ? 'Renew' : 'New Member'}
                                        </h2>
                                        <div className="accent-line mt-1"></div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-white/[0.03] rounded-lg hover:bg-white/[0.06] border border-white/[0.04] transition-all">
                                        <X size={18} className="text-gray-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Photo - Disable for Renew to keep UI clean, enable for Edit/New */}
                                    {editMode !== 'renew' && (
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-24 h-24 rounded-full bg-[#050816]/80 border-2 border-dashed border-gold-400/30 flex items-center justify-center overflow-hidden relative group">
                                                {newMember.photo ? (
                                                    <img src={newMember.photo} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-400 text-xs text-center px-2">Tap to add photo</span>
                                                )}
                                            </div>
                                            <label className="text-gold-400 text-sm font-tech font-medium cursor-pointer tracking-wider">
                                                Take Photo / Upload
                                                <input type="file" accept="image/*" capture="user" onChange={handlePhotoUpload} className="hidden" />
                                            </label>
                                        </div>
                                    )}

                                    {editMode === 'renew' && (
                                        <div className="bg-gold-500/10 border border-gold-400/20 p-3 rounded-xl">
                                            <p className="text-sm text-gold-300 font-tech">Renewing for: <span className="font-bold text-gold-400">{newMember.name}</span></p>
                                            <p className="text-xs text-gold-500/70 mt-1 font-tech">Current Expiry: {formatDate(members.find(m => m.id === selectedMemberId)?.expiry)}</p>
                                        </div>
                                    )}

                                    <input
                                        required
                                        type="text"
                                        placeholder="Full Name"
                                        className="cosmic-input"
                                        value={newMember.name}
                                        onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                        disabled={editMode === 'renew'}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="cosmic-label">Phone</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="Phone Number"
                                                className="cosmic-input"
                                                value={newMember.phone}
                                                onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                                                disabled={editMode === 'renew'}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="cosmic-label">Height (cm)</label>
                                            <input
                                                type="number"
                                                placeholder="Height"
                                                className="cosmic-input"
                                                value={newMember.height}
                                                onChange={e => setNewMember({ ...newMember, height: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="cosmic-label">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="cosmic-input"
                                            value={newMember.dob}
                                            onChange={e => setNewMember({ ...newMember, dob: e.target.value })}
                                        />
                                    </div>

                                    {/* Plan Type Tabs */}
                                    <div className="space-y-1">
                                        <label className="cosmic-label">Plan Type</label>
                                        <div className="flex bg-[#080d1a]/80 border border-gold-400/15 p-1 rounded-xl gap-1">
                                            {['Monthly', 'Quarterly', 'Yearly'].map((plan) => (
                                                <button
                                                    type="button"
                                                    key={plan}
                                                    onClick={() => setNewMember({ ...newMember, planType: plan })}
                                                    className={`flex-1 py-2.5 rounded-lg text-sm font-tech font-bold tracking-wider transition-all duration-200 ${newMember.planType === plan
                                                        ? 'bg-gold-500/20 text-gold-400 border border-gold-400/50 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                                                        }`}
                                                >
                                                    {plan}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="cosmic-label">Amount</label>
                                        <input
                                            type="number"
                                            placeholder="₹ 0.00"
                                            className="cosmic-input"
                                            value={newMember.amount}
                                            onChange={e => setNewMember({ ...newMember, amount: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="cosmic-label">Start Date</label>
                                            <input
                                                type="date"
                                                className="cosmic-input"
                                                value={newMember.startDate}
                                                onChange={e => setNewMember({ ...newMember, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="cosmic-label">End Date (Auto)</label>
                                            <input
                                                type="date"
                                                disabled
                                                className="cosmic-input"
                                                value={newMember.endDate}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="cosmic-label">Assign Trainer</label>
                                        <select
                                            className="cosmic-input appearance-none"
                                            value={newMember.trainerId || ''}
                                            onChange={e => setNewMember({ ...newMember, trainerId: parseInt(e.target.value) })}
                                        >
                                            <option value="" className="bg-[#0a0d14]">No Trainer Assigned</option>
                                            {trainers && trainers.map(t => (
                                                <option key={t.id} value={t.id} className="bg-[#0a0d14]">{t.name} ({t.specialty})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-3 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="cosmic-btn-ghost flex-1"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="cosmic-btn flex-1"
                                        >
                                            {editMode === 'add' ? 'Add Member' : editMode === 'renew' ? 'Renew' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hidden Invoice Template - Uses invoiceData state */}
            {invoiceData && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden' }}>
                    <div
                        id="invoice-template"
                        className="font-sans"
                        // Hardcode valid colors for html2canvas (no oklch)
                        style={{
                            display: 'block',
                            width: '500px',
                            padding: '32px',
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            border: '1px solid #e5e7eb'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>Gym Manager</h1>
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Premium Fitness Center</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>INVOICE</h2>
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Date: {new Date().toLocaleDateString('en-GB')}</p>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '16px 0', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '600', color: '#4b5563' }}>Billed To:</span>
                                <span style={{ fontWeight: 'bold', color: '#000000' }}>{invoiceData.name || 'Valued Member'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '600', color: '#4b5563' }}>Phone:</span>
                                <span style={{ fontWeight: 'bold', color: '#000000' }}>{invoiceData.phone || 'N/A'}</span>
                            </div>
                        </div>

                        <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f3f4f6' }}>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', color: '#000000' }}>Description</th>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#000000' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', color: '#000000' }}>
                                        <div style={{ fontWeight: 'bold' }}>{invoiceData.planType || 'Membership'}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Valid until {formatDate(invoiceData.expiry || invoiceData.endDate)}</div>
                                    </td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 'bold', color: '#000000' }}>₹{invoiceData.amount || '0'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#1f2937' }} colSpan="2">
                                        Total: ₹{invoiceData.amount || '0'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #f3f4f6', position: 'relative' }}>
                            <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>Thank you for your business!</p>
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(-15deg)',
                                border: '4px solid #22c55e',
                                borderRadius: '9999px',
                                padding: '8px',
                                opacity: 0.8
                            }}>
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', textTransform: 'uppercase' }}>PAID</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Workout Assign Modal */}
            <AnimatePresence>
                {workoutMember && <WorkoutAssignModal member={workoutMember} onClose={() => setWorkoutMember(null)} />}
            </AnimatePresence>

            {/* Diet Assign Modal */}
            <AnimatePresence>
                {dietMember && <DietAssignModal member={dietMember} onClose={() => setDietMember(null)} />}
            </AnimatePresence>
        </motion.div>
    );
};

export default Members;
