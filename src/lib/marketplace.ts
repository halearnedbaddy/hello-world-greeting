export type Product = { id: string; name: string; price: number; category: string; cell: number; description: string };
export const products: Product[] = [
  { id: 'tomatoes', name: 'Fresh Tomatoes', price: 50, category: 'Vegetables', cell: 0, description: 'Fresh and juicy tomatoes, locally sourced from trusted farmers. Perfect for your meals.' },
  { id: 'onions', name: 'Onions', price: 40, category: 'Vegetables', cell: 1, description: 'Fresh red onions from your local market. Full of flavour and ready for your kitchen.' },
  { id: 'potatoes', name: 'Potatoes', price: 60, category: 'Vegetables', cell: 2, description: 'Farm-fresh potatoes, selected by local growers for everyday cooking.' },
  { id: 'carrots', name: 'Carrots', price: 50, category: 'Vegetables', cell: 3, description: 'Sweet, crunchy carrots. Freshly picked and packed by your neighbourhood vendor.' },
  { id: 'bananas', name: 'Bananas', price: 70, category: 'Fruits', cell: 4, description: 'Naturally sweet ripe bananas, fresh from the market.' },
  { id: 'peas', name: 'Green Peas', price: 80, category: 'Vegetables', cell: 5, description: 'Tender green peas, locally grown and freshly harvested.' },
];
export type Cart = Record<string, number>;
export function subtotal(cart: Cart) { return products.reduce((sum, p) => sum + p.price * (cart[p.id] ?? 0), 0); }
export function changeQuantity(cart: Cart, id: string, change: number): Cart {
  const next = { ...cart }; const quantity = Math.max(0, (next[id] ?? 0) + change);
  if (quantity === 0) delete next[id]; else next[id] = quantity;
  return next;
}
export type OrderStatus = 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type Order = { id: string; items: Cart; status: OrderStatus; delivery: boolean; address: string; total: number; eta: string; code: string };
export const sampleOrders: Order[] = [
  { id: 'BEE27842', items: { tomatoes: 2, onions: 1 }, status: 'In Transit', delivery: true, address: 'Mombasa, Kizingo', total: 190, eta: 'Arriving in 12 min', code: '278420' },
  { id: 'BEE27839', items: { bananas: 1 }, status: 'Out for Delivery', delivery: true, address: 'Mombasa, Nyali', total: 120, eta: 'Arriving in 28 min', code: '278390' },
  { id: 'BEE27810', items: { onions: 2 }, status: 'Delivered', delivery: false, address: 'Mombasa, Kenya', total: 80, eta: 'Delivered 2h ago', code: '278100' },
  { id: 'BEE27798', items: { carrots: 3 }, status: 'Delivered', delivery: false, address: 'Mombasa, Kenya', total: 150, eta: 'Delivered 4h ago', code: '277980' },
];
export function orderProduct(order: Order) { return products.find(p => Object.keys(order.items).includes(p.id)) ?? products[0]!; }
export function filterOrders(orders: Order[], status: string, query: string) {
  return orders.filter(o => (status === 'All' || o.status === status) && o.id.toLowerCase().includes(query.replace('#', '').toLowerCase()));
}
