import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Star, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketHeader, Photo, Shell, Stepper } from '@/components/marketplace/shared';
import { useMarketplace } from '@/components/marketplace/store';
import { products } from '@/lib/marketplace';

export const Route = createFileRoute('/product/$id')({
  loader: ({ params }) => { const p = products.find(x => x.id === params.id); if (!p) throw notFound(); return p; },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.name ?? 'Product'} | Beez` }, { name: 'description', content: loaderData?.description ?? 'Fresh produce on Beez.' }, { property: 'og:title', content: `${loaderData?.name ?? 'Product'} | Beez` }, { property: 'og:description', content: loaderData?.description ?? 'Fresh produce.' }, { property: 'og:type', content: 'product' }, { name: 'twitter:card', content: 'summary' }] }),
  component: ProductPage,
});
function ProductPage() {
  const p = Route.useLoaderData(); const [q, setQ] = useState(1); const { change } = useMarketplace(); const nav = useNavigate();
  return <Shell wide><MarketHeader title="" back="/discover" cart /><div className="market-detail-layout market-detail"><Photo product={p} className="market-detail-photo" /><div>
    <h1>{p.name}</h1><p className="market-detail-price !mt-1 !text-primary">KES {p.price} <span className="text-sm text-muted-foreground">/ kg</span></p>
    <p className="flex items-center gap-1 !mt-2"><Star className="h-4 w-4 fill-primary text-primary" />4.8 (124 reviews)</p><p>{p.description}</p>
    <div className="market-chips">{['Fresh', 'Local', 'Quality'].map(t => <Button key={t} variant="outline">{t}</Button>)}</div>
    <Stepper value={q} unit="kg" onChange={d => setQ(v => Math.max(1, v + d))} />
    <Button className="market-cta" onClick={() => { change(p.id, q); nav({ to: '/cart' }); }}>Add to Cart</Button>
    <p className="flex items-center gap-3"><Truck className="h-4 w-4" />Delivery available</p><p className="flex items-center gap-3 !mt-2"><ShieldCheck className="h-4 w-4" />Pay on delivery or M-Pesa</p>
  </div></div></Shell>;
}
