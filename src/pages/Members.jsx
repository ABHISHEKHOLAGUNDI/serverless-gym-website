import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Phone, MoreVertical, Edit, Trash, Download, RefreshCw, X, MessageCircle, Cake } from 'lucide-react'; // Added MessageCircle, Cake
import html2canvas from 'html2canvas';
import { useGymContext } from '../context/GymContext';
import { useLocation } from 'react-router-dom';

const Members = () => {
    const { members, trainers, addMember, updateMember, deleteMember, renewMember } = useGymContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [members, setMembers] = useState(DUMMY_MEMBERS); // Removed local state
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [editMode, setEditMode] = useState(false); // false | 'edit' | 'renew'
    const [selectedMemberId, setSelectedMemberId] = useState(null);

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
    // Auto-calculate End Date
    useEffect(() => {
        if (newMember.startDate && newMember.planType) {
            const start = new Date(newMember.startDate);
            let end = new Date(start);
            if (newMember.planType === 'Monthly') end.setMonth(end.getMonth() + 1);
            else if (newMember.planType === 'Quarterly') end.setMonth(end.getMonth() + 3);
            else if (newMember.planType === 'Yearly') end.setFullYear(end.getFullYear() + 1);

            setNewMember(prev => ({ ...prev, endDate: end.toISOString().split('T')[0] }));
        }
    }, [newMember.startDate, newMember.planType]);

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewMember(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenModal = (mode = false, member = null) => {
        setEditMode(mode);
        if (mode === 'edit' && member) {
            setSelectedMemberId(member.id);
            setNewMember({
                name: member.name,
                phone: member.phone,
                height: member.height || '',
                photo: member.photo,
                planType: member.planType || 'Monthly',
                amount: member.amount || '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: member.expiry,
                status: member.status
            });
        } else if (mode === 'renew' && member) {
            setSelectedMemberId(member.id);
            setNewMember({
                name: member.name,
                phone: member.phone,
                height: member.height || '',
                photo: member.photo,
                planType: 'Monthly',
                amount: '',
                startDate: new Date().toISOString().split('T')[0], // Default to Today
                endDate: '',
                status: 'Active'
            });
        } else {
            // New Member
            setSelectedMemberId(null);
            setNewMember({
                name: '',
                phone: '',
                height: '',
                photo: null,
                planType: 'Monthly',
                amount: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            {/* Headers and filters */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Members</h1>
                    <p className="text-sm text-gray-500">
                        {filterParam === 'expired' ? 'Expired Members' : filterParam === 'expiring_soon' ? 'Expiring Soon (1-3 Days)' : 'Manage your gym members'}
                    </p>
                </div>
                {/* Clear Filter Button if filtered */}
                {filterParam && (
                    <button onClick={() => window.history.back()} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">Close Filter</button>
                )}
                <button
                    onClick={() => handleOpenModal(false)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search members..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
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
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ zIndex: activeMenuId === member.id ? 20 : 0 }}
                                className={`backdrop-blur-md p-4 rounded-2xl flex justify-between items-center border shadow-sm transition-all relative ${isExpired ? 'bg-red-50/80 border-red-100' : 'bg-white/80 border-white/50'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    {member.photo ? (
                                        <img src={member.photo} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                                    ) : (
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md ${member.status === 'Active' ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
                                            member.status === 'Expiring' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-gray-400 to-gray-600'
                                            }`}>
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-base">{member.name}</h3>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-medium ${isExpired ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                                Exp: {formatDate(member.expiry)}
                                            </span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${member.status === 'Active' && !isExpired ? 'text-green-600' :
                                                isExpired ? 'text-red-500' : 'text-orange-500'
                                                }`}>
                                                {isExpired ? 'Expired' : member.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2 items-center relative">
                                    {/* Expiry Warning Action */}
                                    {isExpiringSoon && (
                                        <button
                                            onClick={() => sendExpiryReminder(member)}
                                            className="p-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 border border-yellow-200 transition-colors shadow-sm animate-pulse"
                                            title="Send Expiry Reminder"
                                        >
                                            <MessageCircle size={18} />
                                        </button>
                                    )}

                                    {isBirthday && (
                                        <button
                                            onClick={() => sendBirthdayWish(member)}
                                            className="p-2 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 border border-pink-200 transition-colors shadow-sm animate-bounce"
                                            title="Send Birthday Wish"
                                        >
                                            <Cake size={18} />
                                        </button>
                                    )}

                                    {/* Renew Action for Expired */}
                                    {isExpired && (
                                        <button
                                            onClick={() => handleOpenModal('renew', member)}
                                            className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 border border-green-200 transition-colors shadow-sm"
                                            title="Renew Now"
                                        >
                                            <RefreshCw size={18} />
                                        </button>
                                    )}

                                    {/* Native Call Button (Hide if Actions are crowded, or keep small) */}
                                    {!isExpired && !isExpiringSoon && (
                                        <a
                                            href={`tel:${member.phone}`}
                                            className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 border border-green-200 transition-colors shadow-sm"
                                        >
                                            <Phone size={18} />
                                        </a>
                                    )}

                                    {/* 3-Dots Menu Trigger */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === member.id ? null : member.id);
                                        }}
                                        className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 border border-gray-200 transition-colors shadow-sm"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    {/* ... (Dropdown Menu remains same) ... */}
                                    <AnimatePresence>
                                        {activeMenuId === member.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                                            >
                                                <button onClick={() => generateInvoice({ ...member, amount: '0.00' })} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                    <Download size={16} className="text-blue-500" /> Invoice
                                                </button>
                                                <button onClick={() => handleOpenModal('edit', member)} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                    <Edit size={16} className="text-orange-500" /> Edit Details
                                                </button>
                                                <button onClick={() => handleOpenModal('renew', member)} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                    <RefreshCw size={16} className="text-green-500" /> Renew
                                                </button>
                                                <div className="h-px bg-gray-100 my-1"></div>
                                                <button onClick={() => handleDelete(member.id)} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                    <Trash size={16} /> Delete
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p>No members found</p>
                    </div>
                )}
            </div>

            {/* Add/Edit/Renew Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {editMode === 'edit' ? 'Edit Member' : editMode === 'renew' ? 'Renew Membership' : 'Add New Member'}
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                        <X size={20} className="text-gray-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Photo - Disable for Renew to keep UI clean, enable for Edit/New */}
                                    {editMode !== 'renew' && (
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                                                {newMember.photo ? (
                                                    <img src={newMember.photo} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-400 text-xs text-center px-2">Tap to add photo</span>
                                                )}
                                            </div>
                                            <label className="text-blue-600 text-sm font-medium cursor-pointer">
                                                Take Photo / Upload
                                                <input type="file" accept="image/*" capture="user" onChange={handlePhotoUpload} className="hidden" />
                                            </label>
                                        </div>
                                    )}

                                    {editMode === 'renew' && (
                                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                            <p className="text-sm text-blue-800 font-medium">Renewing for: <span className="font-bold">{newMember.name}</span></p>
                                            <p className="text-xs text-blue-600 mt-1">Current Expiry: {formatDate(members.find(m => m.id === selectedMemberId)?.expiry)}</p>
                                        </div>
                                    )}

                                    <input
                                        required
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={newMember.name}
                                        onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                        disabled={editMode === 'renew'} // Lock name during renewal
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-gray-500 ml-1">Phone Number</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="Phone Number"
                                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={newMember.phone}
                                                onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                                                disabled={editMode === 'renew'}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-gray-500 ml-1">Height (cm)</label>
                                            <input
                                                type="number"
                                                placeholder="Height (cm)"
                                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={newMember.height}
                                                onChange={e => setNewMember({ ...newMember, height: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500 ml-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={newMember.dob}
                                            onChange={e => setNewMember({ ...newMember, dob: e.target.value })}
                                        />
                                    </div>

                                    {/* Modern Tabs for Plan Type */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 ml-1">Plan Type</label>
                                        <div className="flex bg-gray-100 p-1 rounded-xl">
                                            {['Monthly', 'Quarterly', 'Yearly'].map((plan) => (
                                                <button
                                                    type="button"
                                                    key={plan}
                                                    onClick={() => setNewMember({ ...newMember, planType: plan })}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${newMember.planType === plan
                                                        ? 'bg-white text-blue-600 shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                >
                                                    {plan}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <input
                                        type="number"
                                        placeholder="Amount (₹)"
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newMember.amount}
                                        onChange={e => setNewMember({ ...newMember, amount: e.target.value })}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-gray-500 ml-1">Start Date</label>
                                            <input
                                                type="date"
                                                className="p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={newMember.startDate}
                                                onChange={e => setNewMember({ ...newMember, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-gray-500 ml-1">End Date (Auto)</label>
                                            <input
                                                type="date"
                                                disabled
                                                className="p-3 bg-gray-100 text-gray-500 rounded-xl border border-gray-200 outline-none"
                                                value={newMember.endDate}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500 ml-1">Assign Trainer</label>
                                        <select
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                            value={newMember.trainerId || ''}
                                            onChange={e => setNewMember({ ...newMember, trainerId: parseInt(e.target.value) })}
                                        >
                                            <option value="">No Trainer Assigned</option>
                                            {trainers && trainers.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200"
                                        >
                                            {editMode === 'add' ? 'Add Member' : editMode === 'renew' ? 'Renew Membership' : 'Save Changes'}
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
        </motion.div>
    );
};

export default Members;
