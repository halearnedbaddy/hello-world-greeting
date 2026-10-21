import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Smartphone, Wallet, Landmark, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, MarketHeader, Shell } from '@/components/marketplace/shared';
import { useMarketplace } from '@/components/marketplace/store';
import { subtotal } from '@/lib/marketplace';

export const Route = createFileRoute('/payment')({
  head: () => ({ meta: [{ title: 'Payment | Beez' }, { name: 'description', content: 'Pay with M-Pesa, cash or bank.' }, { property: 'og:title', content: 'Payment | Beez' }, { property: 'og:description', content: 'Pay for your order.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Payment,
});
function Payment() {
  const { cart, delivery, placeOrder } = useMarketplace(); const nav = useNavigate();
  const [m, setM] = useState('mpesa'); const [phone, setPhone] = useState('712 345 678'); const [err, setErr] = useState('');
  const total = subtotal(cart) + (delivery ? 50 : 0);
  if (!Object.keys(cart).length) return <Shell><MarketHeader title="Payment" back="/checkout" /><Empty title="Your cart is empty"><Button asChild className="market-cta"><Link to="/groceries">Shop now</Link></Button></Empty></Shell>;
  const pay = () => { if (m === 'mpesa' && phone.replace(/\D/g, '').length < 9) return setErr('Enter a valid M-Pesa number.'); const o = placeOrder(); if (o) nav({ to: '/order-confirmed/$id', params: { id: o.id } }); };
  const opt = (id: string, Icon: typeof Wallet, t: string, d: string) => <label className="market-option"><input type="radio" name="pm" checked={m === id} onChange={() => setM(id)} /><Icon /><span>{t}<small>{d}</small></span></label>;
  return <Shell><MarketHeader title="Payment" back="/checkout" /><h2 className="font-bold">Select Payment Method</h2>
    {opt('mpesa', Smartphone, 'M-Pesa', 'Pay with your M-Pesa number')}{opt('cash', Wallet, 'Cash on Delivery', 'Pay when you receive your order')}{opt('bank', Landmark, 'Bank Transfer', 'Pay using your bank')}
    {m === 'mpesa' && <label className="market-field"><b className="text-sm">M-Pesa Details</b>Phone Number<span className="flex items-center rounded-md border border-border bg-card px-3"><span className="text-sm">+254</span><input className="!border-0" inputMode="tel" value={phone} onChange={e => { setPhone(e.target.value); setErr(''); }} /></span></label>}
    {err && <p className="market-error">{err}</p>}
    <Button className="market-cta" onClick={pay}>Pay KES {total}</Button>
    {m === 'mpesa' && <><Button asChild variant="outline" className="market-cta !mt-3"><Link to="/scan-pay"><QrCode />Scan & Pay instead</Link></Button><p className="market-safe">You will receive an STK push on your phone. Enter your M-Pesa PIN to complete the payment.</p></>}
  </Shell>;
}
