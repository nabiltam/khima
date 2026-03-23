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

import { User } from 'firebase/auth';

interface DashboardProps {
  bookings: Booking[];
  pendingReminders: Array<{ booking: Booking, type: '24h' | '1h' }>;
  onEditBooking: (booking: Booking) => void;
  onSendReminder: (booking: Booking, type: '24h' | '1h') => void;
  onDeleteBooking: (id: string) => void;
  onViewAll: () => void;
  user?: User | null;
}

export default function Dashboard({ bookings, pendingReminders, onEditBooking, onSendReminder, onDeleteBooking, onViewAll, user }: DashboardProps) {
  const stats = {
    totalReserved: bookings.filter(b => b.status === 'active').length,
    availableTents: 3 - bookings.filter(b => b.status === 'active').length, // Total 3 tents
    totalRevenue: bookings.reduce((acc, b) => acc + b.totalPrice, 0),
    pendingPayments: bookings.reduce((acc, b) => acc + b.remaining, 0),
  };

  const activeBookings = bookings
    .filter(b => b.status === 'active')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const recentActivity = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            مرحباً بك يا مديرة أعمالي شمس
          </h2>
          <p className="text-muted-foreground font-medium">
            حفظكِ الله ورعاكِ يا جميلتي، إليكِ حالة الحجوزات اليوم
          </p>
        </div>
        <div className="w-20 h-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hidden md:block border border-border">
          <Tent size={40} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="الخيام المحجوزة" 
          value={stats.totalReserved} 
          icon={Tent} 
          trend="الحالة الحالية"
          color="bg-primary text-primary-foreground"
        />
        <StatCard 
          label="الخيام المتاحة" 
          value={stats.availableTents} 
          icon={TrendingUp} 
          trend="من أصل 3"
          color="bg-card border border-border"
        />
        <StatCard 
          label="إجمالي الإيرادات" 
          value={`${stats.totalRevenue.toLocaleString()} د.ج`} 
          icon={DollarSign} 
          trend="+12% هذا الشهر"
          color="bg-card border border-border"
        />
        <StatCard 
          label="المبالغ المتبقية" 
          value={`${stats.pendingPayments.toLocaleString()} د.ج`} 
          icon={Users} 
          trend="تحصيل 92%"
          color="bg-card border border-border"
        />
      </div>

      {/* Reminders Section */}
      {pendingReminders.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 text-white rounded-lg animate-pulse">
              <Bell size={18} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">تذكيرات معلقة ({pendingReminders.length})</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReminders.map(({ booking, type }) => (
              <div 
                key={`${booking.id}-${type}`}
                className="bg-card p-6 rounded-3xl border-2 border-red-500/20 flex items-center justify-between gap-4 shadow-lg shadow-red-500/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center font-bold">
                    {type === '24h' ? '24h' : '1h'}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{booking.customerName}</h4>
                    <p className="text-xs font-medium text-muted-foreground">خيمة {booking.tentId} • {booking.pickupTime}</p>
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
          <h3 className="text-2xl font-bold tracking-tight text-foreground">الحجوزات النشطة</h3>
          <button 
            onClick={onViewAll}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            عرض الكل
          </button>
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
            <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl">
              <p className="text-muted-foreground font-medium">لا توجد حجوزات نشطة حالياً</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">آخر النشاطات</h3>
        </div>
        
        <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-xl shadow-black/5">
          <div className="divide-y divide-border">
            {recentActivity.length > 0 ? (
              recentActivity.map((booking) => (
                <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
                      booking.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                    )}>
                      {booking.tentId}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{booking.customerName}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {booking.status === 'active' ? 'حجز جديد' : 'حجز مكتمل'} • {format(new Date(booking.createdAt), 'd MMM HH:mm', { locale: ar })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{booking.totalPrice.toLocaleString()} د.ج</p>
                    <p className="text-[10px] text-muted-foreground font-medium">الموقع: {booking.location}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground font-medium">لا توجد نشاطات حديثة</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  return (
    <div className={cn("p-8 rounded-[2rem] flex flex-col gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1", color)}>
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", color.includes('bg-primary') ? "bg-white/10" : "bg-muted")}>
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
      className="group bg-card p-6 rounded-[2rem] border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-2xl font-bold text-primary">
          {booking.tentId}
        </div>
        <div className="space-y-1">
          <h4 className="text-xl font-bold tracking-tight text-foreground group-hover:translate-x-1 transition-transform duration-300">{booking.customerName}</h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {booking.location}</span>
            <span className="flex items-center gap-1.5"><Tent size={14} /> {booking.tentSize}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">التاريخ</p>
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Calendar size={14} className="text-primary" />
            {format(new Date(booking.startDate), 'd MMM', { locale: ar })}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">المبلغ المتبقي</p>
          <p className={cn("text-sm font-bold", booking.remaining > 0 ? "text-red-500" : "text-emerald-500")}>
            {booking.remaining.toLocaleString()} د.ج
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={`tel:${booking.customerPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-3 bg-muted hover:bg-primary hover:text-primary-foreground rounded-2xl transition-all duration-300"
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
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-300">
            التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
}
