import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, ShoppingBasket, Smartphone, Shirt, Home, HeartPulse, LayoutGrid, Search, ShoppingCart, Bell, Truck, MapPin, Star, ChevronRight, Tag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Brand, Location, Photo, Shell } from '@/components/marketplace/shared';
import { useMarketplace } from '@/components/marketplace/store';
import { products, subtotal, type Product } from '@/lib/marketplace';
import vendorA from '@/assets/hero-vendor.jpg';
import vendorB from '@/assets/vendor-man.jpg';
import produce from '@/assets/market-produce.jpg';

export const Route = createFileRoute('/discover')({
  head: () => ({ meta: [{ title: 'Discover fresh local produce | Beez' }, { name: 'description', content: 'Shop fresh groceries from local Mombasa vendors, delivered.' }, { property: 'og:title', content: 'Discover | Beez' }, { property: 'og:description', content: 'Fresh groceries at great prices from trusted local merchants.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Discover,
});

const cats = [{ i: ShoppingBasket, l: 'Groceries', h: 150 }, { i: Smartphone, l: 'Electronics', h: 240 }, { i: Shirt, l: 'Fashion', h: 0 }, { i: Home, l: 'Home & Living', h: 300 }, { i: HeartPulse, l: 'Beauty & Health', h: 30 }, { i: LayoutGrid, l: 'More', h: 260 }];
const merchants = [
  { n: 'Tamu Fresh', c: 'Groceries & More', img: produce, r: 4.6, v: 120 },
  { n: 'Mama Zawadi', c: 'Fruits & Vegetables', img: vendorA, r: 4.8, v: 96 },
  { n: 'Baraka Stores', c: 'Grains & Dairy', img: vendorB, r: 4.5, v: 86 },
  { n: 'Nyali Greens', c: 'Organic produce', img: produce, r: 4.7, v: 64 },
];

function SectionHead({ title }: { title: string }) {
  return <div className="market-section-heading mt-7"><h2>{title}</h2><Link to="/groceries" className="flex items-center text-xs text-primary">See all<ChevronRight className="h-4 w-4" /></Link></div>;
}

function AddButton({ p }: { p: Product }) {
  const { cart, change } = useMarketplace(); const n = cart[p.id] ?? 0;
  return <Button variant="outline" size="sm" className="mt-2 h-8 w-full text-[11px]" onClick={() => change(p.id, 1)}>{n ? <><Check />In cart ({n})</> : <><ShoppingCart />Add to Cart</>}</Button>;
}

function Discover() {
  const { cart } = useMarketplace();
  const count = Object.values(cart).reduce((s, n) => s + n, 0);
  return <Shell wide>
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
      <div className="flex min-w-0 items-center gap-3"><Brand /><div className="hidden sm:block"><Location /></div></div>
      <div className="flex shrink-0 items-center gap-1">
        <Button asChild variant="ghost" size="icon" className="relative" aria-label={`Cart, ${count} items`}><Link to="/cart"><ShoppingCart />{count > 0 && <span className="market-count">{count}</span>}</Link></Button>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications"><Bell /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" /></Button>
        <Button asChild variant="outline" size="sm" className="h-9"><Link to="/track"><Truck />Track</Link></Button>
      </div>
    </header>
    <div className="mt-2 sm:hidden"><Location /></div>
    {count > 0 && <p className="mt-1 text-[11px] text-muted-foreground">Cart total: <span className="font-semibold text-foreground">KES {subtotal(cart).toLocaleString()}</span></p>}

    <Link to="/groceries" className="market-search mt-3 !rounded-full"><Search /><span className="truncate text-xs text-muted-foreground">Search for products, merchants or categories...</span></Link>

    <section className="market-banner"><Photo product={products[0]!} /><div className="market-banner-content"><h1>Fresh Groceries at Great Prices</h1><p>Quality products from trusted local merchants.</p><Button asChild className="rounded-full"><Link to="/groceries">Shop Now <ArrowRight /></Link></Button></div></section>
    <div className="mt-2 flex justify-center gap-1.5" aria-hidden><span className="h-1.5 w-5 rounded-full bg-primary" /><span className="h-1.5 w-2 rounded-full bg-border" /><span className="h-1.5 w-2 rounded-full bg-border" /></div>

    <div className="market-tiles mt-5">{cats.map(c => <Link key={c.l} to="/groceries" className="market-tile" style={{ '--tile-h': c.h } as React.CSSProperties}><c.i /><span>{c.l}</span></Link>)}</div>

    <SectionHead title="Featured Merchants" />
    <div className="market-hscroll">{merchants.map(m => <Link key={m.n} to="/groceries" className="market-merchant"><img src={m.img} alt={m.n} loading="lazy" /><div className="p-2.5"><h3 className="truncate text-sm font-semibold">{m.n}</h3><p className="truncate text-[11px] text-muted-foreground">{m.c}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" />Mombasa</p><div className="mt-1.5 flex items-center justify-between"><span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">● Open</span><span className="flex items-center gap-0.5 text-[11px]"><Star className="h-3 w-3 fill-primary text-primary" />{m.r} <span className="text-muted-foreground">({m.v})</span></span></div></div></Link>)}</div>

    <SectionHead title="Popular Products" />
    <div className="market-grid sm:!grid-cols-4">{products.slice(0, 4).map((p, i) => <div key={p.id} className="market-product relative">{i === 0 && <span className="absolute right-3 top-3 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">-10%</span>}<Link to="/product/$id" params={{ id: p.id }}><Photo product={p} /><h2 className="truncate">{p.name} (1kg)</h2><p className="text-muted-foreground">Tamu Fresh</p></Link><p className="!mt-1 text-sm font-bold">KES {p.price}</p><p className="flex items-center gap-1 text-[10px] text-primary">● In Stock</p><AddButton p={p} /></div>)}</div>

    <SectionHead title="Recently Added" />
    <div className="grid gap-3 sm:grid-cols-2">{products.slice(2).map(p => <div key={p.id} className="flex gap-3 rounded-lg border border-border bg-card p-2.5"><Link to="/product/$id" params={{ id: p.id }} className="w-20 shrink-0"><Photo product={p} className="aspect-square rounded-md" /></Link><div className="min-w-0 flex-1"><h3 className="truncate text-xs font-semibold">{p.name} (1kg)</h3><p className="text-[11px] text-muted-foreground">Tamu Fresh</p><p className="text-xs font-bold">KES {p.price}</p><AddButton p={p} /></div></div>)}</div>

    <section className="mt-7 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Tag className="h-5 w-5" /></span>
      <div className="min-w-0"><h2 className="font-bold text-primary">Special Offers</h2><p className="text-[11px] text-muted-foreground">Grab the best deals from your favourite merchants.</p></div>
      <Button asChild className="col-span-2 rounded-full sm:col-span-1"><Link to="/groceries">View Offers <ArrowRight /></Link></Button>
    </section>
  </Shell>;
}
