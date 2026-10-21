import { createFileRoute, Link } from '@tanstack/react-router';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Shell } from '@/components/marketplace/shared';
import { useMarketplace } from '@/components/marketplace/store';
import { itemCount } from '@/components/marketplace/track-parts';

export const Route = createFileRoute('/order-confirmed/$id')({
  head: () => ({ meta: [{ title: 'Order Confirmed | Beez' }, { name: 'description', content: 'Your Beez order has been placed.' }, { property: 'og:title', content: 'Order Confirmed | Beez' }, { property: 'og:description', content: 'Thanks for supporting local vendors.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Confirmed,
});
function Confirmed() {
  const { id } = Route.useParams(); const o = useMarketplace().orders.find(x => x.id === id);
  return <Shell><div className="market-success"><CircleCheck /><h1>Order Confirmed!</h1><p>Your order has been placed successfully. You'll receive updates on your delivery.</p></div>
    {o && <div className="market-summary"><h2>Order #{o.id}</h2><p className="text-xs text-muted-foreground">{itemCount(o)} items · KES {o.total - (o.delivery ? 50 : 0)}</p><div className="market-totals"><div><span>Delivery Fee</span><span>KES {o.delivery ? 50 : 0}</span></div><div><span>Total</span><span>KES {o.total}</span></div></div></div>}
    <Button asChild className="market-cta"><Link to="/order/$id" params={{ id }}>View Order</Link></Button>
    <Button asChild variant="outline" className="market-cta !mt-3"><Link to="/order/$id/track" params={{ id }}>Track Order</Link></Button>
    <Button asChild variant="outline" className="market-cta !mt-3"><Link to="/discover">Continue Shopping</Link></Button>
    <p className="mt-8 text-center font-semibold">Thanks for supporting local vendors! 💛</p>
  </Shell>;
}
