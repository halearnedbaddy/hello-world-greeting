import { Link } from '@tanstack/react-router';
import { Bike, Check, ChevronRight, Home, MessageSquare, Package, Phone, Star, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import map from '@/assets/mombasa-map.jpg';
import rider from '@/assets/rider.jpg';
import { orderProduct, products, type Order } from '@/lib/marketplace';
import { Photo } from './shared';

export const statusClass = (s: string) => s === 'Delivered' ? 'done' : s === 'Out for Delivery' ? 'out' : s === 'Cancelled' ? 'cancelled' : '';
export const itemCount = (o: Order) => Object.values(o.items).reduce((a, b) => a + b, 0);

export function OrderRow({ order }: { order: Order }) {
  const p = orderProduct(order);
  return <Link to="/order/$id" params={{ id: order.id }} className="market-order"><Photo product={p} /><div className="min-w-0 flex-1"><h2 className="truncate">{p.name}</h2><p>Order #{order.id} · KES {order.total}</p><p>{itemCount(order)} items</p></div><div className="shrink-0 text-right"><span className={`market-status ${statusClass(order.status)}`}>{order.status}</span><p>{order.eta}</p></div><ChevronRight className="h-4 w-4 shrink-0" /></Link>;
}

const steps = [{ l: 'Confirmed', t: '12:45 PM', i: Check }, { l: 'Preparing', t: '12:58 PM', i: Package }, { l: 'Out for Delivery', t: '1:25 PM', i: Bike }, { l: 'Delivered', t: '2:37 PM', i: Home }];
export function stepIndex(o: Order) { return o.status === 'Delivered' ? 3 : o.status === 'Out for Delivery' ? 2 : 1; }
export function Progress({ order }: { order: Order }) {
  const n = stepIndex(order);
  return <div className="market-progress">{steps.map((s, i) => <div key={s.l} className={i < n ? 'passed' : i === n ? 'passed current' : ''}><s.i />{s.l}<small>{i <= n ? s.t : ''}</small></div>)}</div>;
}
export function Timeline({ order }: { order: Order }) {
  const n = stepIndex(order) + 1;
  const all = [{ l: 'Order Placed', t: '12:45 PM' }, { l: 'Payment Confirmed', t: '12:46 PM' }, { l: 'Preparing Your Order', t: '12:58 PM' }, { l: 'Out for Delivery', t: '1:25 PM' }, { l: 'Delivered', t: '2:37 PM' }];
  return <ol className="market-timeline">{all.map((s, i) => <li key={s.l} className={i < n ? 'passed' : i === n ? 'current' : ''}>{i < n ? <Check /> : i === n ? <Bike /> : <Home />}<div><h2 className={i === n ? 'text-primary' : ''}>{s.l}</h2><p>{s.t}</p></div></li>)}</ol>;
}
export function MapView({ tall = false }: { tall?: boolean }) {
  return <div className="market-map" style={tall ? { height: 440 } : undefined}><img src={map} alt="Delivery route across Mombasa" width={1024} height={1024} /><svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M27 30 L40 38 L52 42 L58 60 L72 72" /><circle cx="58" cy="60" r="1.5" /></svg><span className="map-label map-mombasa">Mombasa</span><span className="map-label map-kizingo">Kizingo</span><span className="map-pin map-store"><Store /></span><span className="map-pin map-bike"><Bike /></span><span className="map-pin map-home"><Home /></span></div>;
}
export function RiderCard({ order, actions = true }: { order: Order; actions?: boolean }) {
  return <div className="market-rider"><div className="flex items-center gap-3"><img src={rider} alt="James Mwangi" width={44} height={44} /><div className="min-w-0 flex-1"><h2>James Mwangi</h2><small>Rider · {order.id}</small><small className="flex items-center gap-1"><Star className="h-3 w-3 fill-primary text-primary" />4.8 (124 deliveries)</small></div><Button asChild size="icon" variant="outline" aria-label="Call rider"><a href="tel:+254712345678"><Phone /></a></Button><Button size="icon" variant="outline" aria-label="Message rider"><MessageSquare /></Button></div><p className="arrival">{order.eta}</p><p className="distance">2.4 km away · 8 min</p>{actions && <div className="mt-4 grid grid-cols-2 gap-3"><Button asChild className="rounded-full"><a href="tel:+254712345678">Call Rider</a></Button><Button variant="outline" className="rounded-full">Message</Button></div>}</div>;
}
export function itemsOf(o: Order) { return products.filter(p => o.items[p.id]).map(p => ({ p, q: o.items[p.id] ?? 0 })); }
