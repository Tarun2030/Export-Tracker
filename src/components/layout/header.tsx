'use client';

import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/data-service';
import { getLCExpiryAlert } from '@/lib/export-excel';
import { Order } from '@/types/database';

interface LCAlert {
  order: Order;
  message: string;
  color: string;
}

export default function Header() {
  const [alerts, setAlerts] = useState<LCAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const orders = await getOrders();
        const lcAlerts: LCAlert[] = [];
        orders.forEach((order) => {
          const alert = getLCExpiryAlert(order.lc_expiry_date);
          if (alert) {
            lcAlerts.push({ order, message: alert.message, color: alert.color });
          }
        });
        setAlerts(lcAlerts);
      } catch {
        // silently fail
      }
    }
    fetchAlerts();
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 lg:px-6 bg-white border-b border-slate-200 shadow-sm">
      <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
      <h2 className="text-sm font-medium text-slate-600 hidden sm:block">
        Export Business Management
      </h2>
      <div className="flex items-center gap-3">
        {/* LC Alerts */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowAlerts(!showAlerts)}
          >
            <Bell className="h-5 w-5 text-slate-500" />
            {alerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </Button>

          {showAlerts && alerts.length > 0 && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-2 max-h-80 overflow-y-auto">
              <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase">
                LC Expiry Alerts
              </p>
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 border-b border-slate-100 last:border-0 ${alert.color}`}
                >
                  <p className="text-sm font-medium">{alert.order.order_number}</p>
                  <p className="text-xs">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {alert.order.customer?.company_name || 'Unknown Customer'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Badge variant="outline" className="text-xs hidden sm:inline-flex">
          Demo Mode
        </Badge>
      </div>
    </header>
  );
}
