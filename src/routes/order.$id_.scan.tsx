import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, MarketHeader, SafeNote, Shell } from '@/components/marketplace/shared';
import { useMarketplace } from '@/components/marketplace/store';

export const Route = createFileRoute('/order/$id_/scan')({
  head: () => ({ meta: [{ title: 'Scan Code | Beez' }, { name: 'description', content: 'Confirm your delivery.' }, { property: 'og:title', content: 'Scan Code | Beez' }, { property: 'og:description', content: 'Confirm delivery with a code.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Scan,
});
function Scan() {
  const { id } = Route.useParams(); const { orders, deliver } = useMarketplace(); const o = orders.find(x => x.id === id); const nav = useNavigate();
  const [c, setC] = useState(''); const [err, setErr] = useState('');
  if (!o) return <Shell active="Track"><MarketHeader title="Scan Code" back="/track" /><Empty title="Order not found" /></Shell>;
  const confirm = () => { if (c !== o.code) return setErr('That code does not match this order.'); deliver(o.id); nav({ to: '/order/$id/delivered', params: { id } }); };
  return <Shell active="Track"><MarketHeader title="Scan Code" back="/track" /><div className="market-qr text-market-canvas"><QrCode className="h-full w-full" /></div>
    <h2 className="text-center font-bold">Scan the QR code at delivery</h2><p className="text-center text-xs text-muted-foreground">to complete the payment and confirm your order.</p><p className="my-4 text-center text-xs">OR</p>
    <label className="market-field market-summary">Enter 6-digit code<input inputMode="numeric" maxLength={6} placeholder="• • • • • •" value={c} onChange={e => { setC(e.target.value.replace(/\D/g, '')); setErr(''); }} /></label>
    {err && <p className="market-error">{err}</p>}
    <Button className="market-cta" disabled={c.length < 6} onClick={confirm}>Confirm</Button>
    <SafeNote>This code is also shared with your rider for quick delivery confirmation. Demo code: {o.code}</SafeNote>
  </Shell>;
}
