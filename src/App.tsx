/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BookingForm from './components/BookingForm';
import CustomerDirectory from './components/CustomerDirectory';
import { LayoutDashboard, Users, PlusCircle, Search, Menu, X, Trash2 } from 'lucide-react';
import { Booking, Customer } from './types';
import { cn } from './lib/utils';
import { differenceInHours, parseISO, isBefore, addHours } from 'date-fns';

// Mock Data
const INITIAL_CUSTOMERS: Customer[] = [
  { id: '2', name: 'سارة علي', phone: '0660987654' },
];

const INITIAL_BOOKINGS: Booking[] = [];

const LOCATIONS = [
  '5 جويلة',
  'سرسوف',
  'تافسيت',
  'قطع الواد',
  'الشموع',
  'ادريان',
  'سرسوف الفراي',
  'مالطا',
  'الجزيرة',
  'فيراج انكوف',
  'انكوف',
  'الوئام'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('tent_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('tent_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [pendingReminders, setPendingReminders] = useState<Array<{ booking: Booking, type: '24h' | '1h' }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  // Persist data
  useEffect(() => {
    localStorage.setItem('tent_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('tent_customers', JSON.stringify(customers));
  }, [customers]);

  // Automated Reminder Check Logic
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const newReminders: Array<{ booking: Booking, type: '24h' | '1h' }> = [];

      bookings.forEach(booking => {
        if (booking.status !== 'active') return;

        const startDateTime = parseISO(`${booking.startDate}T${booking.pickupTime}`);
        const hoursToStart = differenceInHours(startDateTime, now);

        // 24h Reminder
        if (hoursToStart <= 24 && hoursToStart > 1 && !booking.reminder24hSent) {
          newReminders.push({ booking, type: '24h' });
        }

        // 1h Reminder
        if (hoursToStart <= 1 && hoursToStart > 0 && !booking.reminder1hSent) {
          newReminders.push({ booking, type: '1h' });
        }
      });

      setPendingReminders(newReminders);
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [bookings]);

  const handleSendReminder = (booking: Booking, type: '24h' | '1h') => {
    let message = '';
    if (type === '24h') {
      message = `تذكير: حجزك لخيمة رقم ${booking.tentId} يبدأ غداً في تمام الساعة ${booking.pickupTime}. المبلغ المتبقي: ${booking.remaining} د.ج. نتطلع لرؤيتك!`;
    } else {
      message = `تذكير: موعد استلام خيمتك (رقم ${booking.tentId}) بعد ساعة واحدة. يرجى التواجد في الموقع. المبلغ المتبقي: ${booking.remaining} د.ج.`;
    }

    const url = `https://wa.me/${booking.customerPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Mark as sent
    setBookings(prev => prev.map(b => 
      b.id === booking.id 
        ? { ...b, [type === '24h' ? 'reminder24hSent' : 'reminder1hSent']: true } 
        : b
    ));
  };

  const handleSaveBooking = (bookingData: Partial<Booking>) => {
    if (editingBooking) {
      setBookings(prev => prev.map(b => b.id === editingBooking.id ? { ...b, ...bookingData } as Booking : b));
    } else {
      const newBooking: Booking = {
        ...bookingData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      } as Booking;
      setBookings(prev => [...prev, newBooking]);
      
      // Add customer if new
      if (!customers.find(c => c.phone === newBooking.customerPhone)) {
        setCustomers(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: newBooking.customerName,
          phone: newBooking.customerPhone
        }]);
      }
    }
    setShowBookingForm(false);
    setEditingBooking(null);
    setActiveTab('dashboard');
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setShowBookingForm(true);
  };

  const handleDeleteBooking = (id: string) => {
    setBookingToDelete(id);
  };

  const confirmDelete = () => {
    if (bookingToDelete) {
      setBookings(prev => prev.filter(b => b.id !== bookingToDelete));
      setBookingToDelete(null);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomerToDelete(id);
  };

  const confirmDeleteCustomer = () => {
    if (customerToDelete) {
      setCustomers(prev => prev.filter(c => c.id !== customerToDelete));
      setCustomerToDelete(null);
    }
  };

  const handleMarkAsCompleted = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b));
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.customerPhone.includes(searchTerm);
    const matchesLocation = locationFilter === 'all' || b.location.includes(locationFilter);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  const filteredTotalRevenue = filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => {
      if (tab === 'new-booking') {
        setEditingBooking(null);
        setShowBookingForm(true);
      } else {
        setActiveTab(tab);
      }
    }}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          bookings={bookings} 
          pendingReminders={pendingReminders}
          onEditBooking={handleEditBooking} 
          onSendReminder={handleSendReminder}
          onDeleteBooking={handleDeleteBooking}
        />
      )}
      
      {activeTab === 'customers' && (
        <CustomerDirectory 
          customers={customers} 
          bookings={bookings} 
          onDeleteCustomer={handleDeleteCustomer}
        />
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">سجل الحجوزات</h2>
              <p className="text-[#1A1A1A]/60 font-medium">البحث والفلترة في جميع الحجوزات</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="flex bg-[#1A1A1A]/5 p-1 rounded-2xl">
                <button 
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-bold transition-all",
                    statusFilter === 'all' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                  )}
                >
                  الكل
                </button>
                <button 
                  onClick={() => setStatusFilter('active')}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-bold transition-all",
                    statusFilter === 'active' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                  )}
                >
                  نشط
                </button>
                <button 
                  onClick={() => setStatusFilter('completed')}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-bold transition-all",
                    statusFilter === 'completed' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                  )}
                >
                  مكتمل
                </button>
              </div>
              <div className="relative w-full md:w-64">
                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
                <input
                  type="text"
                  placeholder="بحث..."
                  className="w-full pl-14 pr-6 py-4 bg-white border border-[#1A1A1A]/5 rounded-2xl focus:ring-2 focus:ring-[#1A1A1A] transition-all font-bold shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-6 py-4 bg-white border border-[#1A1A1A]/5 rounded-2xl font-bold shadow-sm"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="all">كل المواقع</option>
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Revenue Summary for Filtered View */}
          <div className="bg-[#1A1A1A] p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl shadow-[#1A1A1A]/20">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest">إجمالي مبالغ الحجوزات المعروضة</p>
              <h3 className="text-4xl font-bold tracking-tight">
                {filteredTotalRevenue.toLocaleString()} <span className="text-xl opacity-40">د.ج</span>
              </h3>
            </div>
            <div className="px-6 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <p className="text-xs font-bold text-white/60">عدد الحجوزات: {filteredBookings.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white p-6 rounded-3xl border border-[#1A1A1A]/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-[#1A1A1A]/5 rounded-xl flex items-center justify-center font-bold">
                    {booking.tentId}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1A1A]">{booking.customerName}</h4>
                    <p className="text-sm text-[#1A1A1A]/40">{booking.startDate} إلى {booking.endDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                    booking.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-[#1A1A1A]/5 text-[#1A1A1A]/40"
                  )}>
                    {booking.status === 'active' ? 'نشط' : 'مكتمل'}
                  </span>
                  {booking.status === 'active' && (
                    <button 
                      onClick={() => handleMarkAsCompleted(booking.id)}
                      className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      إكمال
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditBooking(booking)}
                    className="text-sm font-bold text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                  >
                    تعديل
                  </button>
                  <button 
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">الإعدادات</h2>
            <p className="text-[#1A1A1A]/60 font-medium">إدارة التطبيق والبيانات</p>
          </div>

          <div className="bg-white p-12 rounded-[3rem] border border-[#1A1A1A]/5 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-500">منطقة الخطر</h3>
              <p className="text-[#1A1A1A]/60">سيؤدي مسح البيانات إلى حذف جميع الحجوزات والزبائن بشكل نهائي.</p>
              <button 
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من رغبتك في مسح جميع البيانات؟')) {
                    setBookings([]);
                    setCustomers([]);
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="px-8 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all"
              >
                مسح جميع البيانات
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookingForm && (
        <BookingForm 
          booking={editingBooking}
          customers={customers}
          onSave={handleSaveBooking}
          onClose={() => {
            setShowBookingForm(false);
            setEditingBooking(null);
          }}
        />
      )}

      {/* Custom Confirmation Modal */}
      {bookingToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl border border-[#1A1A1A]/5 space-y-6">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold text-[#1A1A1A]">تأكيد الحذف</h3>
              <p className="text-[#1A1A1A]/60 font-medium">هل أنت متأكد من رغبتك في حذف هذا الحجز؟ لا يمكن التراجع عن هذه العملية.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setBookingToDelete(null)}
                className="flex-1 py-4 bg-[#1A1A1A]/5 text-[#1A1A1A] rounded-2xl font-bold hover:bg-[#1A1A1A]/10 transition-all"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl border border-[#1A1A1A]/5 space-y-6">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold text-[#1A1A1A]">حذف الزبون</h3>
              <p className="text-[#1A1A1A]/60 font-medium">هل أنت متأكد من رغبتك في حذف هذا الزبون؟ سيتم حذف بياناته من السجل فقط (الحجوزات ستبقى موجودة).</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setCustomerToDelete(null)}
                className="flex-1 py-4 bg-[#1A1A1A]/5 text-[#1A1A1A] rounded-2xl font-bold hover:bg-[#1A1A1A]/10 transition-all"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDeleteCustomer}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
