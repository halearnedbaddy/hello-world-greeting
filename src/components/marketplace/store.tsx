import { createContext, useContext, useState, type ReactNode } from 'react';
import { changeQuantity, sampleOrders, subtotal, type Cart, type Order } from '@/lib/marketplace';
type Store = { cart: Cart; change: (id: string, delta: number) => void; clear: () => void; orders: Order[]; delivery: boolean; setDelivery: (value: boolean) => void; address: string; setAddress: (value: string) => void; instructions: string; setInstructions: (value: string) => void; placeOrder: () => Order | undefined; deliver: (id: string) => void };
const StoreContext = createContext<Store | null>(null);
export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [orders, setOrders] = useState(sampleOrders);
  const [delivery, setDelivery] = useState(true);
  const [address, setAddress] = useState('Mombasa, Kenya');
  const [instructions, setInstructions] = useState('');
  function placeOrder() {
    if (!Object.keys(cart).length) return;
    const id = `BEE${Date.now().toString().slice(-6)}`;
    const order: Order = { id, items: { ...cart }, status: 'In Transit', delivery, address, total: subtotal(cart) + (delivery ? 50 : 0), eta: 'Preparing your order', code: id.slice(-6) };
    setOrders(current => [order, ...current]); setCart({}); return order;
  }
  return <StoreContext.Provider value={{ cart, change: (id, delta) => setCart(current => changeQuantity(current, id, delta)), clear: () => setCart({}), orders, delivery, setDelivery, address, setAddress, instructions, setInstructions, placeOrder, deliver: id => setOrders(current => current.map(o => o.id === id ? { ...o, status: 'Delivered', eta: 'Delivered just now' } : o)) }}>{children}</StoreContext.Provider>;
}
export function useMarketplace() { const value = useContext(StoreContext); if (!value) throw new Error('Marketplace provider is missing'); return value; }
