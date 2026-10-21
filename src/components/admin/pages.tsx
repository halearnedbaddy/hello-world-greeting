// @ts-nocheck
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageTitle } from '@/components/admin/AdminShell';
import { db, useTable, kes, timeAgo, pillClass, ORDER_STATUSES, customersFromOrders, revenueOf, statusCounts, topMerchants, exportCsv, inLastDays } from '@/lib/admin-data';

function Empty({ loaded, n, error }) {
  if (error) return <p className="ad-msg">{error}</p>;
  if (!loaded) return <p className="ad-muted">Loading…</p>;
  if (!n) return <p className="ad-muted">Nothing here yet.</p>;
  return null;
}

export function OrdersPage({ q = '' }) {
  const { rows, loaded, error } = useTable('orders');
  const [s, setS] = useState(q); const [st, setSt] = useState('');
  const list = rows.filter((o) => (!st || o.status === st) && (!s || `${o.id} ${o.customer_name} ${o.customer_phone} ${o.merchant_name}`.toLowerCase().includes(s.toLowerCase())));
  const update = async (id, status) => { const { error } = await db.from('orders').update({ status }).eq('id', id); if (error) alert(error.message); };
  return (<div className="ad-page">
    <PageTitle title="Orders" sub={`${rows.length} orders`} action={<button className="ad-btn ghost" onClick={() => exportCsv('orders.csv', list)}>Export CSV</button>} />
    <div className="ad-card">
      <div className="ad-toolbar"><input className="ad-input" placeholder="Search ID, customer, phone, merchant" value={s} onChange={(e) => setS(e.target.value)} />
        <select className="ad-input" value={st} onChange={(e) => setSt(e.target.value)}><option value="">All statuses</option>{ORDER_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></div>
      <Empty loaded={loaded} n={list.length} error={error} />
      {list.length > 0 && <table className="ad-table"><thead><tr><th>ID</th><th>Customer</th><th>Merchant</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Time</th></tr></thead><tbody>
        {list.map((o) => <tr key={o.id}><td>#{o.id}</td><td>{o.customer_name || '—'}<br /><span className="ad-muted">{o.customer_phone}</span></td><td>{o.merchant_name}</td><td>{o.items_summary}</td><td>{kes(o.total_kes)}</td><td>{o.payment_method}</td>
          <td><select className="ad-input" value={o.status} onChange={(e) => update(o.id, e.target.value)}>{ORDER_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></td><td>{timeAgo(o.created_at)}</td></tr>)}
      </tbody></table>}
    </div></div>);
}

export function CustomersPage() {
  const { rows, loaded, error } = useTable('orders');
  const list = customersFromOrders(rows);
  return (<div className="ad-page"><PageTitle title="Customers" sub="Built from order history" action={<button className="ad-btn ghost" onClick={() => exportCsv('customers.csv', list)}>Export CSV</button>} />
    <div className="ad-card"><Empty loaded={loaded} n={list.length} error={error} />
      {list.length > 0 && <table className="ad-table"><thead><tr><th>Name</th><th>Phone</th><th>Area</th><th>Orders</th><th>Spent</th><th>Last order</th></tr></thead><tbody>
        {list.map((c) => <tr key={c.key}><td>{c.name}</td><td>{c.phone || '—'}</td><td>{c.area}</td><td>{c.orders}</td><td>{kes(c.spent)}</td><td>{timeAgo(c.last)}</td></tr>)}</tbody></table>}
    </div></div>);
}

export function MerchantsPage() {
  const { rows, loaded, error } = useTable('merchants');
  const [f, setF] = useState({ name: '', area: '', phone: '' });
  const add = async (e) => { e.preventDefault(); const { error } = await db.from('merchants').insert(f); if (error) alert(error.message); else setF({ name: '', area: '', phone: '' }); };
  const toggle = (m) => db.from('merchants').update({ active: !m.active }).eq('id', m.id);
  const del = async (m) => { if (confirm(`Delete ${m.name}?`)) { const { error } = await db.from('merchants').delete().eq('id', m.id); if (error) alert(error.message); } };
  return (<div className="ad-page"><PageTitle title="Merchants" sub={`${rows.filter((m) => m.active).length} active`} />
    <form className="ad-card ad-form" onSubmit={add}>
      <label>Shop name<input className="ad-input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <label>Area<input className="ad-input" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} /></label>
      <label>Phone<input className="ad-input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
      <button className="ad-btn">Add merchant</button></form>
    <div className="ad-card"><Empty loaded={loaded} n={rows.length} error={error} />
      {rows.length > 0 && <table className="ad-table"><thead><tr><th>Name</th><th>Area</th><th>Phone</th><th>Status</th><th></th></tr></thead><tbody>
        {rows.map((m) => <tr key={m.id}><td>{m.name}</td><td>{m.area}</td><td>{m.phone}</td><td><span className={`ad-pill ${m.active ? 'done' : 'cancel'}`}>{m.active ? 'Active' : 'Paused'}</span></td>
          <td><button className="ad-btn ghost sm" onClick={() => toggle(m)}>{m.active ? 'Pause' : 'Activate'}</button> <button className="ad-btn ghost sm" onClick={() => del(m)}>Delete</button></td></tr>)}</tbody></table>}
    </div></div>);
}

export function ProductsPage() {
  const { rows, loaded, error } = useTable('products');
  const { rows: merchants } = useTable('merchants');
  const blank = { name: '', category: '', price_kes: '', stock: '', merchant_id: '' };
  const [f, setF] = useState(blank);
  const add = async (e) => { e.preventDefault();
    const { error } = await db.from('products').insert({ ...f, price_kes: Number(f.price_kes) || 0, stock: Number(f.stock) || 0, merchant_id: f.merchant_id || null });
    if (error) alert(error.message); else setF(blank); };
  const mName = (id) => merchants.find((m) => m.id === id)?.name ?? '—';
  const setStock = (p, stock) => db.from('products').update({ stock: Math.max(0, stock) }).eq('id', p.id);
  return (<div className="ad-page"><PageTitle title="Products" sub={`${rows.length} products`} />
    <form className="ad-card ad-form" onSubmit={add}>
      <label>Name<input className="ad-input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <label>Category<input className="ad-input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></label>
      <label>Price (KES)<input className="ad-input" type="number" min="0" value={f.price_kes} onChange={(e) => setF({ ...f, price_kes: e.target.value })} /></label>
      <label>Stock<input className="ad-input" type="number" min="0" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} /></label>
      <label>Merchant<select className="ad-input" value={f.merchant_id} onChange={(e) => setF({ ...f, merchant_id: e.target.value })}><option value="">None</option>{merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
      <button className="ad-btn">Add product</button></form>
    <div className="ad-card"><Empty loaded={loaded} n={rows.length} error={error} />
      {rows.length > 0 && <table className="ad-table"><thead><tr><th>Name</th><th>Category</th><th>Merchant</th><th>Price</th><th>Stock</th><th></th></tr></thead><tbody>
        {rows.map((p) => <tr key={p.id}><td>{p.name}</td><td>{p.category}</td><td>{mName(p.merchant_id)}</td><td>{kes(p.price_kes)}</td>
          <td><button className="ad-btn ghost sm" onClick={() => setStock(p, p.stock - 1)}>−</button> {p.stock} <button className="ad-btn ghost sm" onClick={() => setStock(p, p.stock + 1)}>+</button></td>
          <td><button className="ad-btn ghost sm" onClick={() => confirm(`Delete ${p.name}?`) && db.from('products').delete().eq('id', p.id)}>Delete</button></td></tr>)}</tbody></table>}
    </div></div>);
}

export function RidersPage() {
  const { rows, loaded, error } = useTable('riders');
  const { rows: orders } = useTable('orders');
  const done = (id) => orders.filter((o) => o.rider_id === id && o.status === 'Delivered');
  return (<div className="ad-page"><PageTitle title="Riders" sub={`${rows.filter((r) => r.online).length} online of ${rows.length}`} />
    <div className="ad-card"><Empty loaded={loaded} n={rows.length} error={error} />
      {rows.length > 0 && <table className="ad-table"><thead><tr><th>Name</th><th>Phone</th><th>Status</th><th>Deliveries</th><th>Earnings</th><th>Joined</th><th></th></tr></thead><tbody>
        {rows.map((r) => <tr key={r.id}><td>{r.full_name || '—'}</td><td>{r.phone}</td><td><span className={`ad-pill ${r.online ? 'done' : 'cancel'}`}>{r.online ? 'Online' : 'Offline'}</span></td>
          <td>{done(r.id).length}</td><td>{kes(done(r.id).reduce((a, o) => a + o.rider_earning_kes, 0))}</td><td>{timeAgo(r.created_at)}</td>
          <td>{r.online && <button className="ad-btn ghost sm" onClick={() => db.from('riders').update({ online: false }).eq('id', r.id)}>Set offline</button>}</td></tr>)}</tbody></table>}
    </div></div>);
}

export function DeliveriesPage() {
  const { rows, loaded, error } = useTable('orders');
  const { rows: riders } = useTable('riders');
  const list = rows.filter((o) => !['Delivered', 'Cancelled'].includes(o.status));
  const rName = (id) => riders.find((r) => r.id === id)?.full_name || (id ? 'Assigned' : 'Unassigned');
  return (<div className="ad-page"><PageTitle title="Deliveries" sub={`${list.length} in progress`} />
    <div className="ad-card"><Empty loaded={loaded} n={list.length} error={error} />
      {list.length > 0 && <table className="ad-table"><thead><tr><th>Order</th><th>Pickup</th><th>Drop-off</th><th>Rider</th><th>Status</th><th>Assigned</th></tr></thead><tbody>
        {list.map((o) => <tr key={o.id}><td>#{o.id}</td><td>{o.merchant_name} · {o.pickup_area}</td><td>{o.customer_area}</td><td>{rName(o.rider_id)}</td>
          <td><span className={`ad-pill ${pillClass(o.status)}`}>{o.status}</span></td><td>{o.assigned_at ? timeAgo(o.assigned_at) : '—'}</td></tr>)}</tbody></table>}
    </div></div>);
}

export function PaymentsPage() {
  const { rows, loaded, error } = useTable('orders');
  const paid = rows.filter((o) => o.status !== 'Cancelled');
  const r = revenueOf(paid);
  const byMethod = {}; for (const o of paid) byMethod[o.payment_method] = (byMethod[o.payment_method] ?? 0) + o.total_kes;
  return (<div className="ad-page"><PageTitle title="Payments" sub="All non-cancelled orders" action={<button className="ad-btn ghost" onClick={() => exportCsv('payments.csv', paid.map((o) => ({ id: o.id, method: o.payment_method, total: o.total_kes, delivery: o.delivery_fee_kes, service: o.service_fee_kes, date: o.created_at })))}>Export CSV</button>} />
    <div className="ad-kpis">{[['Total collected', r.total], ['Products', r.products], ['Delivery fees', r.delivery], ['Service fees', r.service], ...Object.entries(byMethod)].map(([k, v]) => <div key={k} className="ad-card"><span className="ad-muted">{k}</span><b>{kes(v)}</b></div>)}</div>
    <div className="ad-card"><Empty loaded={loaded} n={paid.length} error={error} />
      {paid.length > 0 && <table className="ad-table"><thead><tr><th>Order</th><th>Method</th><th>Total</th><th>Delivery</th><th>Service</th><th>Time</th></tr></thead><tbody>
        {paid.map((o) => <tr key={o.id}><td>#{o.id}</td><td>{o.payment_method}</td><td>{kes(o.total_kes)}</td><td>{kes(o.delivery_fee_kes)}</td><td>{kes(o.service_fee_kes)}</td><td>{timeAgo(o.created_at)}</td></tr>)}</tbody></table>}
    </div></div>);
}

export function ReportsPage() {
  const { rows } = useTable('orders');
  const [days, setDays] = useState(30);
  const list = inLastDays(rows, days);
  const r = revenueOf(list), c = statusCounts(list), top = topMerchants(list, 10);
  return (<div className="ad-page"><PageTitle title="Reports" action={<select className="ad-input" value={days} onChange={(e) => setDays(Number(e.target.value))}>{[7, 30, 90, 365].map((d) => <option key={d} value={d}>Last {d} days</option>)}</select>} />
    <div className="ad-kpis">{[['Orders', list.length], ['Revenue', kes(r.total)], ['Delivered', c.Delivered], ['In transit', c['In Transit']], ['Pending', c.Pending], ['Cancelled', c.Cancelled]].map(([k, v]) => <div key={k} className="ad-card"><span className="ad-muted">{k}</span><b>{v}</b></div>)}</div>
    <div className="ad-card"><h3>Top merchants</h3>
      <table className="ad-table"><thead><tr><th>#</th><th>Merchant</th><th>Orders</th><th>Revenue</th></tr></thead><tbody>
        {top.map((m, i) => <tr key={m.name}><td>{i + 1}</td><td>{m.name}</td><td>{m.orders}</td><td>{kes(m.revenue)}</td></tr>)}</tbody></table>
      <button className="ad-btn ghost" onClick={() => exportCsv('report.csv', top)}>Export CSV</button></div></div>);
}

export function SupportPage() {
  const { rows, loaded, error } = useTable('support_tickets');
  const blank = { subject: '', customer_name: '', customer_phone: '', order_id: '', priority: 'Medium' };
  const [f, setF] = useState(blank);
  const add = async (e) => { e.preventDefault(); const { error } = await db.from('support_tickets').insert({ ...f, order_id: f.order_id || null }); if (error) alert(error.message); else setF(blank); };
  const set = (t, patch) => db.from('support_tickets').update(patch).eq('id', t.id);
  return (<div className="ad-page"><PageTitle title="Support" sub={`${rows.filter((t) => t.status === 'Open').length} open tickets`} />
    <form className="ad-card ad-form" onSubmit={add}>
      <label>Subject<input className="ad-input" required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></label>
      <label>Customer<input className="ad-input" value={f.customer_name} onChange={(e) => setF({ ...f, customer_name: e.target.value })} /></label>
      <label>Phone<input className="ad-input" value={f.customer_phone} onChange={(e) => setF({ ...f, customer_phone: e.target.value })} /></label>
      <label>Order ID<input className="ad-input" value={f.order_id} onChange={(e) => setF({ ...f, order_id: e.target.value })} /></label>
      <label>Priority<select className="ad-input" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>{['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}</select></label>
      <button className="ad-btn">Open ticket</button></form>
    <div className="ad-card"><Empty loaded={loaded} n={rows.length} error={error} />
      {rows.length > 0 && <table className="ad-table"><thead><tr><th>ID</th><th>Subject</th><th>Customer</th><th>Order</th><th>Priority</th><th>Status</th><th>Notes</th></tr></thead><tbody>
        {rows.map((t) => <tr key={t.id}><td>TKT-{t.ticket_no}</td><td>{t.subject}</td><td>{t.customer_name}<br /><span className="ad-muted">{t.customer_phone}</span></td><td>{t.order_id ? `#${t.order_id}` : '—'}</td><td>{t.priority}</td>
          <td><select className="ad-input" value={t.status} onChange={(e) => set(t, { status: e.target.value })}>{['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => <option key={s}>{s}</option>)}</select></td>
          <td><input className="ad-input" defaultValue={t.notes} onBlur={(e) => e.target.value !== t.notes && set(t, { notes: e.target.value })} /></td></tr>)}</tbody></table>}
    </div></div>);
}

export function SettingsPage() {
  const [cur, setCur] = useState(''); const [pw, setPw] = useState(''); const [msg, setMsg] = useState('');
  const save = async (e) => { e.preventDefault(); setMsg('');
    const { error } = await supabase.auth.updateUser({ password: pw, current_password: cur });
    setMsg(error ? error.message : 'Password updated.'); if (!error) { setCur(''); setPw(''); } };
  return (<div className="ad-page"><PageTitle title="Settings" sub="Your admin account" />
    <form className="ad-card ad-login" onSubmit={save}><h3>Change password</h3>
      <label>Current password<input className="ad-input" type="password" required value={cur} onChange={(e) => setCur(e.target.value)} /></label>
      <label>New password<input className="ad-input" type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} /></label>
      {msg && <p className="ad-msg">{msg}</p>}<button className="ad-btn">Save</button></form></div>);
}
