/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Phone, MessageSquare, Calendar, User, ArrowRight, Trash2 } from 'lucide-react';
import { Customer, Booking } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CustomerDirectoryProps {
  customers: Customer[];
  bookings: Booking[];
  onDeleteCustomer: (id: string) => void;
}

export default function CustomerDirectory({ customers, bookings, onDeleteCustomer }: CustomerDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const getCustomerStats = (customerId: string) => {
    const customerBookings = bookings.filter(b => b.customerId === customerId);
    return {
      totalBookings: customerBookings.length,
      lastBooking: customerBookings.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0],
    };
  };

  const sendWhatsApp = (customer: Customer, booking?: Booking) => {
    let message = `مرحباً ${customer.name}، تفاصيل حجزك في خيمتي:\n`;
    if (booking) {
      message += `خيمة رقم: ${booking.tentId}\n`;
      message += `تاريخ البداية: ${booking.startDate}\n`;
      message += `المبلغ المتبقي: ${booking.remaining} د.ج\n`;
    }
    const url = `https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">سجل الزبائن</h2>
          <p className="text-[#1A1A1A]/60 font-medium">إدارة بيانات الزبائن وتاريخ حجوزاتهم</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-[#1A1A1A]/5 rounded-2xl focus:ring-2 focus:ring-[#1A1A1A] transition-all font-bold shadow-sm"
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const stats = getCustomerStats(customer.id);
          return (
            <div 
              key={customer.id}
              className="group bg-white p-8 rounded-[2.5rem] border border-[#1A1A1A]/5 hover:border-[#1A1A1A]/20 hover:shadow-2xl transition-all duration-500 flex flex-col gap-8"
            >
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 bg-[#1A1A1A] text-white rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={`tel:${customer.phone}`}
                    className="p-3 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A] hover:text-white rounded-xl transition-all duration-300"
                  >
                    <Phone size={18} />
                  </a>
                  <button 
                    onClick={() => sendWhatsApp(customer, stats.lastBooking)}
                    className="p-3 bg-[#1A1A1A]/5 hover:bg-emerald-500 hover:text-white rounded-xl transition-all duration-300"
                  >
                    <MessageSquare size={18} />
                  </button>
                  <button 
                    onClick={() => onDeleteCustomer(customer.id)}
                    className="p-3 bg-[#1A1A1A]/5 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">{customer.name}</h4>
                <p className="text-sm font-bold text-[#1A1A1A]/40">{customer.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#1A1A1A]/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">إجمالي الحجوزات</p>
                  <p className="text-xl font-bold text-[#1A1A1A]">{stats.totalBookings}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">آخر حجز</p>
                  <p className="text-sm font-bold text-[#1A1A1A]">
                    {stats.lastBooking ? format(new Date(stats.lastBooking.startDate), 'd MMM yyyy', { locale: ar }) : 'لا يوجد'}
                  </p>
                </div>
              </div>

              <button className="w-full py-4 bg-[#1A1A1A]/5 text-[#1A1A1A] rounded-2xl text-sm font-bold hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                عرض السجل الكامل
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
