import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DbOrder = {
  id: string;
  merchant_name: string;
  pickup_area: string;
  customer_area: string;
  items_summary: string;
  total_kes: number;
  status: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_lat: number;
  drop_lng: number;
  rider_lat: number | null;
  rider_lng: number | null;
  created_at: string;
  updated_at: string;
};

export function useLiveOrders() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setOrders(data as DbOrder[]);
        if (!cancelled) setLoaded(true);
      });

    const channel = supabase
      .channel('live-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((current) => {
          if (payload.eventType === 'DELETE') return current.filter((o) => o.id !== (payload.old as { id: string }).id);
          const row = payload.new as DbOrder;
          const rest = current.filter((o) => o.id !== row.id);
          return [row, ...rest];
        });
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { orders, loaded };
}

export async function advanceRider(orderId: string) {
  await supabase.rpc('advance_rider', { order_id: orderId });
}
