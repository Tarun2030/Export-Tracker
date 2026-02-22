'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  CreditCard,
  Ship,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { getDashboardStats, getOrders, getPayments, getShipments } from '@/lib/data-service';
import { DashboardStats, Order, Payment, Shipment } from '@/types/database';
import { formatCurrency, formatDate, getStatusColor, calculateOverdueDays } from '@/lib/export-excel';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [overduePayments, setOverduePayments] = useState<Payment[]>([]);
  const [activeShipments, setActiveShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashStats, orders, payments, shipments] = await Promise.all([
          getDashboardStats(),
          getOrders(),
          getPayments(),
          getShipments(),
        ]);

        setStats(dashStats);
        setRecentOrders(orders.slice(0, 5));
        setOverduePayments(
          payments
            .filter((p) => p.status !== 'received' && calculateOverdueDays(p.payment_due_date) > 0)
            .sort((a, b) => calculateOverdueDays(b.payment_due_date) - calculateOverdueDays(a.payment_due_date))
        );
        setActiveShipments(shipments.filter((s) => s.status === 'in_transit' || s.status === 'loaded'));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your export business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-slate-500 mt-1">All time orders</p>
          </CardContent>
        </Card>

        <Link href="/payments" className="block">
        <Card className={`border-l-4 ${stats?.overduePayments ? 'border-l-red-500' : 'border-l-yellow-500'} hover:shadow-md transition-shadow cursor-pointer`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Payments</CardTitle>
            <CreditCard className={`h-5 w-5 ${stats?.overduePayments ? 'text-red-500' : 'text-yellow-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats?.overduePayments ? 'text-red-600' : 'text-slate-900'}`}>
              {stats?.pendingPayments || 0}
            </div>
            {stats?.overduePayments ? (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {stats.overduePayments} overdue &gt;30 days
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">All payments on track</p>
            )}
          </CardContent>
        </Card>
        </Link>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">In Transit</CardTitle>
            <Ship className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats?.shipmentsInTransit || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Shipments on water</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">This Month Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {formatCurrency(stats?.thisMonthRevenue || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">February 2026</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Open Inquiries</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInquiries || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.conversionRate || 0).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link href="/orders/list">
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/orders/list"
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-slate-500">{order.customer?.company_name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(order.total_amount, order.currency)}</p>
                    <Badge className={`text-[10px] ${getStatusColor(order.status)}`} variant="secondary">
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </Link>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Overdue Payments</CardTitle>
            <Link href="/payments">
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overduePayments.map((payment) => {
                const days = calculateOverdueDays(payment.payment_due_date);
                const outstanding = payment.invoice_amount - payment.amount_received;
                return (
                  <Link
                    key={payment.id}
                    href="/payments"
                    className={`flex items-center justify-between p-3 rounded-lg hover:opacity-80 transition-opacity ${
                      days > 60 ? 'bg-red-50 border border-red-200' : days > 30 ? 'bg-orange-50 border border-orange-200' : 'bg-yellow-50 border border-yellow-200'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">{payment.payment_reference}</p>
                      <p className="text-xs text-slate-500">Due: {formatDate(payment.payment_due_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(outstanding, payment.invoice_currency)}</p>
                      <p className={`text-xs font-bold ${days > 60 ? 'text-red-600' : days > 30 ? 'text-orange-600' : 'text-yellow-600'}`}>
                        {days} days overdue
                      </p>
                    </div>
                  </Link>
                );
              })}
              {overduePayments.length === 0 && (
                <p className="text-sm text-green-600 text-center py-4">No overdue payments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Shipments */}
      {activeShipments.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Active Shipments</CardTitle>
            <Link href="/shipments">
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeShipments.map((shipment) => (
                <div key={shipment.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{shipment.shipment_number}</p>
                    <Badge className="bg-purple-100 text-purple-800 text-[10px]" variant="secondary">
                      {shipment.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    {shipment.vessel_name} &middot; {shipment.container_number}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {shipment.origin_port} &rarr; {shipment.destination_port}
                  </p>
                  <p className="text-xs text-slate-500">
                    ETA: {formatDate(shipment.eta)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
