'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getShipments } from '@/lib/data-service';
import { Shipment } from '@/types/database';
import { formatCurrency, formatDate, getStatusColor, exportToExcel } from '@/lib/export-excel';
import { Download, Search, Ship, Anchor, MapPin } from 'lucide-react';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getShipments();
        setShipments(data);
      } catch (error) {
        console.error('Failed to fetch shipments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const matchesSearch =
        !search ||
        s.shipment_number.toLowerCase().includes(search.toLowerCase()) ||
        s.vessel_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.bl_number?.toLowerCase().includes(search.toLowerCase()) ||
        s.container_number?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shipments, search, statusFilter]);

  const handleExport = () => {
    const exportData = filteredShipments.map((s) => ({
      'Shipment #': s.shipment_number,
      'Shipment Date': s.shipment_date || '',
      Vessel: s.vessel_name || '',
      'Voyage #': s.voyage_number || '',
      'B/L Number': s.bl_number || '',
      'B/L Date': s.bl_date || '',
      Container: s.container_number || '',
      'Container Size': s.container_size,
      'Shipping Line': s.shipping_line || '',
      'Origin Port': s.origin_port || '',
      'Destination Port': s.destination_port || '',
      ETD: s.etd || '',
      ETA: s.eta || '',
      'Freight Amount': s.freight_amount,
      'CHA Name': s.cha_name || '',
      Status: s.status,
    }));
    exportToExcel(exportData, `shipments-${new Date().toISOString().split('T')[0]}`, 'Shipments');
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    shipments.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return counts;
  }, [shipments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shipments</h1>
          <p className="text-sm text-slate-500 mt-1">Track your export dispatches</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {['booked', 'loaded', 'in_transit', 'arrived', 'delivered', 'cancelled'].map((status) => (
          <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}>
            <CardContent className="pt-4 pb-3 px-4 text-center">
              <p className={`text-2xl font-bold ${status === statusFilter ? 'text-emerald-600' : ''}`}>
                {statusCounts[status] || 0}
              </p>
              <Badge className={`text-[10px] mt-1 ${getStatusColor(status)}`} variant="secondary">
                {status.replace(/_/g, ' ')}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by shipment, vessel, B/L, container..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="loaded">Loaded</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="arrived">Arrived</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment #</TableHead>
                  <TableHead>Vessel / Container</TableHead>
                  <TableHead>B/L Number</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>ETD</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Shipping Line</TableHead>
                  <TableHead className="text-right">Freight</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-emerald-700">{s.shipment_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Ship className="h-3.5 w-3.5 text-slate-400" />
                        <div>
                          <p className="text-sm">{s.vessel_name || '-'}</p>
                          <p className="text-xs text-slate-400">{s.container_number} ({s.container_size})</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{s.bl_number || '-'}</p>
                      <p className="text-xs text-slate-400">{formatDate(s.bl_date)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Anchor className="h-3 w-3 text-blue-500" />
                        <span>{s.origin_port}</span>
                        <span className="text-slate-300">&rarr;</span>
                        <MapPin className="h-3 w-3 text-red-500" />
                        <span>{s.destination_port}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(s.etd)}</TableCell>
                    <TableCell className="text-sm">{formatDate(s.eta)}</TableCell>
                    <TableCell className="text-sm">{s.shipping_line || '-'}</TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(s.freight_amount, s.freight_currency)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${getStatusColor(s.status)}`} variant="secondary">
                        {s.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredShipments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No shipments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
