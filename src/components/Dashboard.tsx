/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, Tent, Users, DollarSign, Phone, Calendar, MapPin, Bell, MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Booking } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  bookings: Booking[];
  pendingReminders: Array<{ booking: Booking, type: '24h' | '1h' }>;
  onEditBooking: (booking: Booking) => void;
  onSendReminder: (booking: Booking, type: '24h' | '1h') => void;
  onDeleteBooking: (id: string) => void;
}

export default function Dashboard({ bookings, pendingReminders, onEditBooking, onSendReminder, onDeleteBooking }: DashboardProps) {
  const stats = {
    totalReserved: bookings.filter(b => b.status === 'active').length,
    availableTents: 3 - bookings.filter(b => b.status === 'active').length, // Total 3 tents
    totalRevenue: bookings.reduce((acc, b) => acc + b.totalPrice, 0),
    pendingPayments: bookings.reduce((acc, b) => acc + b.remaining, 0),
  };

  const activeBookings = bookings
    .filter(b => b.status === 'active')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">لوحة التحكم</h2>
        <p className="text-[#1A1A1A]/60 font-medium">نظرة عامة على حالة الحجوزات اليوم</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="الخيام المحجوزة" 
          value={stats.totalReserved} 
          icon={Tent} 
          trend="الحالة الحالية"
          color="bg-[#1A1A1A] text-white"
        />
        <StatCard 
          label="الخيام المتاحة" 
          value={stats.availableTents} 
          icon={TrendingUp} 
          trend="من أصل 3"
          color="bg-white border border-[#1A1A1A]/5"
        />
        <StatCard 
          label="إجمالي الإيرادات" 
          value={`${stats.totalRevenue.toLocaleString()} د.ج`} 
          icon={DollarSign} 
          trend="+12% هذا الشهر"
          color="bg-white border border-[#1A1A1A]/5"
        />
        <StatCard 
          label="المبالغ المتبقية" 
          value={`${stats.pendingPayments.toLocaleString()} د.ج`} 
          icon={Users} 
          trend="تحصيل 92%"
          color="bg-white border border-[#1A1A1A]/5"
        />
      </div>

      {/* Reminders Section */}
      {pendingReminders.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 text-white rounded-lg animate-pulse">
              <Bell size={18} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">تذكيرات معلقة ({pendingReminders.length})</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReminders.map(({ booking, type }) => (
              <div 
                key={`${booking.id}-${type}`}
                className="bg-white p-6 rounded-3xl border-2 border-red-500/20 flex items-center justify-between gap-4 shadow-lg shadow-red-500/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold">
                    {type === '24h' ? '24h' : '1h'}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1A1A]">{booking.customerName}</h4>
                    <p className="text-xs font-medium text-[#1A1A1A]/40">خيمة {booking.tentId} • {booking.pickupTime}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onSendReminder(booking, type)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all"
                >
                  <MessageSquare size={16} />
                  إرسال واتساب
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Bookings List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">الحجوزات النشطة</h3>
          <button className="text-sm font-semibold text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors">عرض الكل</button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {activeBookings.length > 0 ? (
            activeBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onClick={() => onEditBooking(booking)} 
                onDelete={() => onDeleteBooking(booking.id)}
              />
            ))
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-[#1A1A1A]/10 rounded-3xl">
              <p className="text-[#1A1A1A]/40 font-medium">لا توجد حجوزات نشطة حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  return (
    <div className={cn("p-8 rounded-[2rem] flex flex-col gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1", color)}>
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", color.includes('bg-[#1A1A1A]') ? "bg-white/10" : "bg-[#1A1A1A]/5")}>
          <Icon size={24} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{trend}</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
        <p className="text-3xl font-bold tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

interface BookingCardProps {
  key?: string;
  booking: Booking;
  onClick: () => void;
  onDelete: () => void;
}

function BookingCard({ booking, onClick, onDelete }: BookingCardProps) {
  return (
    <div 
      onClick={onClick}
      className="group bg-white p-6 rounded-[2rem] border border-[#1A1A1A]/5 hover:border-[#1A1A1A]/20 hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-[#1A1A1A]/5 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#1A1A1A]">
          {booking.tentId}
        </div>
        <div className="space-y-1">
          <h4 className="text-xl font-bold tracking-tight text-[#1A1A1A] group-hover:translate-x-1 transition-transform duration-300">{booking.customerName}</h4>
          <div className="flex items-center gap-4 text-sm text-[#1A1A1A]/60 font-medium">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {booking.location}</span>
            <span className="flex items-center gap-1.5"><Tent size={14} /> {booking.tentSize}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">التاريخ</p>
          <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
            <Calendar size={14} className="text-[#1A1A1A]/40" />
            {format(new Date(booking.startDate), 'd MMM', { locale: ar })}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">المبلغ المتبقي</p>
          <p className={cn("text-sm font-bold", booking.remaining > 0 ? "text-red-500" : "text-emerald-500")}>
            {booking.remaining.toLocaleString()} د.ج
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={`tel:${booking.customerPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-3 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A] hover:text-white rounded-2xl transition-all duration-300"
          >
            <Phone size={18} />
          </a>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
          >
            <Trash2 size={18} />
          </button>
          <button className="px-6 py-3 bg-[#1A1A1A] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#1A1A1A]/20 opacity-0 group-hover:opacity-100 transition-all duration-300">
            التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
}
