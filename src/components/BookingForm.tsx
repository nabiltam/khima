/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Phone, User, Tent, MapPin, DollarSign, Calendar, Clock } from 'lucide-react';
import { Booking, TentSize, Customer } from '../types';
import { cn } from '../lib/utils';

interface BookingFormProps {
  booking?: Booking | null;
  customers: Customer[];
  onSave: (booking: Partial<Booking>) => void;
  onClose: () => void;
}

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

export default function BookingForm({ booking, customers, onSave, onClose }: BookingFormProps) {
  const [formData, setFormData] = useState<Partial<Booking>>({
    tentId: '',
    tentSize: '12/12',
    location: '',
    customerName: '',
    customerPhone: '',
    totalPrice: 0,
    deposit: 0,
    remaining: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    pickupTime: '10:00',
    status: 'active',
  });

  useEffect(() => {
    if (booking) {
      setFormData(booking);
    }
  }, [booking]);

  useEffect(() => {
    const total = Number(formData.totalPrice) || 0;
    const dep = Number(formData.deposit) || 0;
    setFormData(prev => ({ ...prev, remaining: total - dep }));
  }, [formData.totalPrice, formData.deposit]);

  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({ ...prev, customerPhone: phone }));
    const existingCustomer = customers.find(c => c.phone === phone);
    if (existingCustomer) {
      setFormData(prev => ({ ...prev, customerName: existingCustomer.name, customerId: existingCustomer.id }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-black/40 backdrop-blur-md">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-xl shadow-black/10 border border-border">
        {/* Header */}
        <div className="sticky top-0 bg-card/80 backdrop-blur-md p-8 border-b border-border flex items-center justify-between z-10">
          <div className="flex flex-col gap-1">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">
              {booking ? 'تعديل حجز' : 'حجز خيمة جديد'}
            </h3>
            <p className="text-muted-foreground font-medium text-sm">أدخل تفاصيل الحجز والزبون بدقة</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-muted rounded-full transition-colors text-foreground">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-12">
          {/* Section: Tent Info */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Tent size={20} />
              <h4 className="text-xs font-bold uppercase tracking-widest">بيانات الخيمة</h4>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">رقم الخيمة</label>
                <select
                  required
                  value={formData.tentId}
                  onChange={e => setFormData({ ...formData, tentId: e.target.value })}
                  className="w-full px-6 py-4 bg-muted border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-bold text-foreground"
                >
                  <option value="">اختر خيمة</option>
                  <option value="1">خيمة 1</option>
                  <option value="2">خيمة 2</option>
                  <option value="3">خيمة 3</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">حجم الخيمة</label>
                <select
                  value={formData.tentSize}
                  onChange={e => setFormData({ ...formData, tentSize: e.target.value as TentSize })}
                  className="w-full px-6 py-4 bg-muted border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-bold text-foreground"
                >
                  <option value="12/12">12/12</option>
                  <option value="9/12">9/12</option>
                  <option value="9/9">9/9</option>
                  <option value="12/15">12/15</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">المكان</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    required
                    list="locations-list"
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 bg-muted border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-bold text-foreground"
                    placeholder="اختر أو اكتب المكان..."
                  />
                  <datalist id="locations-list">
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Customer Info */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <User size={20} />
              <h4 className="text-xs font-bold uppercase tracking-widest">بيانات الزبون</h4>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">رقم الهاتف</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    required
                    type="tel"
                    value={formData.customerPhone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-muted border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-bold text-foreground"
                    placeholder="05XXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">اسم الزبون</label>
                <div className="relative">
                  <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 bg-muted border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-bold text-foreground"
                    placeholder="الاسم الكامل"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Financials */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <DollarSign size={20} />
              <h4 className="text-xs font-bold uppercase tracking-widest">التفاصيل المالية</h4>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">السعر الإجمالي</label>
                  <input
                    required
                    type="number"
                    value={formData.totalPrice}
                    onChange={e => setFormData({ ...formData, totalPrice: Number(e.target.value) })}
                    className="w-full px-6 py-4 bg-muted border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-bold text-foreground"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1600, 1800, 2000, 2600, 400].map(price => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setFormData({ ...formData, totalPrice: price })}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                        formData.totalPrice === price 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-card text-muted-foreground border-border hover:border-primary/30"
                      )}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">العربون المدفوع</label>
                  <input
                    required
                    type="number"
                    value={formData.deposit}
                    onChange={e => setFormData({ ...formData, deposit: Number(e.target.value) })}
                    className="w-full px-6 py-4 bg-muted border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-bold text-foreground"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[400, 500, 1000].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setFormData({ ...formData, deposit: amount })}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                        formData.deposit === amount 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-card text-muted-foreground border-border hover:border-primary/30"
                      )}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">المبلغ المتبقي</label>
                <div className="w-full px-6 py-4 bg-muted border-none rounded-2xl font-bold text-red-500">
                  {formData.remaining?.toLocaleString()} د.ج
                </div>
              </div>
            </div>
          </div>

          {/* Section: Time & Date */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar size={20} />
              <h4 className="text-xs font-bold uppercase tracking-widest">الوقت والتاريخ</h4>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">تاريخ البداية</label>
                <input
                  required
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-6 py-4 bg-muted border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-bold text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">تاريخ النهاية</label>
                <input
                  required
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-6 py-4 bg-muted border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-bold text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">ساعة الاستلام</label>
                <div className="relative">
                  <Clock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    required
                    type="time"
                    value={formData.pickupTime}
                    onChange={e => setFormData({ ...formData, pickupTime: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 bg-muted border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-bold text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 pt-8 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-muted-foreground font-bold hover:text-foreground transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-12 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <Save size={20} />
              حفظ الحجز
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
