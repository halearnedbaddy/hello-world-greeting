// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useState } from 'react';
import {
  Home, ShoppingBag, Package, Users, Wallet, ChartNoAxesCombined, Megaphone,
  Settings, Search, Bell, ChevronDown, Sun, Hand, Plus, ArrowUpRight,
  CalendarDays, ArrowRight, CreditCard, Share2, Link as LinkIcon, Coins,
  ClipboardList, CircleDollarSign, TrendingUp, Clock3, Star, UserRound,
  CheckCircle2, Box, Eye, Menu, X, Store, ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import beezMark from "@/assets/beez-mark.png.asset.json";
import "./-merchant-dashboard.css";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { merchantQuery } from '@/lib/merchant-query';
import { merchantSummary, bestProducts, money, confirmed } from '@/lib/merchant-data';
import { saveMerchantProduct, prepareMerchantOrder } from '@/lib/merchant.functions';

function ago(iso){const m=Math.round((Date.now()-Date.parse(iso))/60000);return m<60?`${Math.max(m,0)} min ago`:m<1440?`${Math.round(m/60)} hr ago`:`${Math.round(m/1440)} d ago`;}

export const Route = createFileRoute("/merchant/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Merchant dashboard | Beez" },
      { name: "description", content: "Your Beez merchant dashboard: sales, orders, top products and payouts." },
      { property: "og:title", content: "Beez merchant dashboard" },
      { property: "og:description", content: "Manage orders, payments and customers on Beez." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" }],
  }),
  component: App,
});


const nav = [
  [Home,'Home'],[ShoppingBag,'Orders'],[Package,'Products'],[Users,'Customers'],
  [Wallet,'Payments'],[ChartNoAxesCombined,'Analytics'],[Megaphone,'Marketing'],[Wallet,'Wallet'],[Settings,'Settings']
];

function App() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery(merchantQuery);
  const [active,setActive] = useState('Home');
  const [productForm,setProductForm] = useState(null);
  const [busy,setBusy] = useState(false);
  const [query,setQuery] = useState('');
  const [range,setRange] = useState('Today');
  const [showNotifications,setShowNotifications] = useState(false);
  const [mobileMenu,setMobileMenu] = useState(false);
  const [notice,setNotice] = useState('');
  const [ordersFilter,setOrdersFilter] = useState('All');
  const action = (msg) => { setNotice(msg); window.setTimeout(()=>setNotice(''),2600); };
  if (isLoading) return <div className="beez-md"><div className="empty" style={{padding:40}}>Loading your business…</div></div>;
  if (error || !data?.merchant) return <div className="beez-md"><div className="empty" style={{padding:40}}>{error ? 'Please sign in with your phone number to open your dashboard.' : 'Set up your business to start using the dashboard.'} <Link to={error ? '/login' : '/onboarding/merchant'}>Continue</Link></div></div>;
  const m = data.merchant;
  const sum = merchantSummary(data.orders, range);
  const itemCount = id => data.items.filter(i=>i.order_id===id).reduce((n,i)=>n+i.quantity,0);
  const statusOf = o => o.status==='Delivered'||o.status==='Cancelled'||o.status==='Ready for Pickup' ? o.status : confirmed(o) ? 'Paid' : 'Pending';
  const orders = data.orders.map(o=>({id:o.id,raw:o,name:o.customer_name||o.id,phone:o.customer_phone||'—',items:`${itemCount(o.id)||'—'} items`,amount:money(o.total_kes),payment:o.payment_method,status:statusOf(o),time:ago(o.created_at),avatar:'🧑🏽'}));
  const products = bestProducts(data.orders, data.items);
  const activity = orders.slice(0,5);
  const pendingCount = data.orders.filter(o=>['Pending','Preparing'].includes(o.status)).length;
  const hour = Number(new Date().toLocaleString('en-US',{timeZone:'Africa/Nairobi',hour:'numeric',hour12:false}));
  const greet = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
  const saveProduct = async () => { setBusy(true); try { await saveMerchantProduct({data:{...productForm,price_kes:Number(productForm.price_kes)||0,stock:Number(productForm.stock)||0}}); await qc.invalidateQueries({queryKey:merchantQuery.queryKey}); setProductForm(null); action('Product saved'); } catch(e){ action(e.message); } finally { setBusy(false); } };
  const prepare = async (id,status) => { try { await prepareMerchantOrder({data:{id,status}}); await qc.invalidateQueries({queryKey:merchantQuery.queryKey}); action(status==='Cancelled'?'Order cancelled':'Marked ready for pickup'); } catch(e){ action(e.message); } };
  const newProduct = () => setProductForm({name:'',category:m.category||'',price_kes:'',stock:'',active:true});
  const filteredOrders = orders.filter(o => `${o.id} ${o.phone} ${o.status}`.toLowerCase().includes(query.toLowerCase()) && (ordersFilter==='All'||o.status===ordersFilter));
  const currentTitle = active === 'Home' ? 'Home' : active;
  return <div className="beez-md"><div className="app-shell">
    <aside className={`sidebar ${mobileMenu?'open':''}`}>
      <div className="logo"><div className="bee-mark"><img src={beezMark.url} alt="Beez" className="h-full w-full object-contain p-1.5" /></div><span>Bee<span>z</span></span><button className="mobile-close" onClick={()=>setMobileMenu(false)}><X/></button></div>
      <nav>{nav.map(([Icon,label])=><button key={label} className={`nav-item ${active===label?'active':''}`} onClick={()=>{setActive(label);setMobileMenu(false)}}><Icon size={20}/><span>{label}</span>{label==='Orders'&&pendingCount>0&&<b className="count">{pendingCount}</b>}</button>)}</nav>
      <div className="sidebar-promo">
        <div className="promo-bee">🐝</div><h3>Grow your business<br/>with <em>Beez</em></h3><p>More customers. More sales.<br/>More growth.</p>
        <button onClick={()=>setActive('Analytics')}>View Insights <ArrowRight size={15}/></button>
      </div>
      <div className="copyright">© {new Date().getFullYear()} Beez. All rights reserved.</div>
    </aside>
    {mobileMenu&&<div className="scrim" onClick={()=>setMobileMenu(false)}/>}
    <div className="main-area">
      <header className="topbar">
        <button className="hamburger" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button>
        <div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search orders, products, or customers..."/></div>
        <div className="top-right">
          <button className="icon-button bell" onClick={()=>setShowNotifications(!showNotifications)}><Bell size={21}/>{pendingCount>0&&<i>{pendingCount}</i>}</button>
          {showNotifications&&<div className="notification-pop"><strong>Notifications</strong>{activity.length?activity.slice(0,3).map(o=><p key={o.id}>Order #{o.id} · {o.amount} · {o.status}</p>):<p>No new activity.</p>}</div>}
          <div className="top-divider"/>
          <button className="profile" onClick={()=>action('Account menu opened')}><div className="avatar owner">👨🏽</div><span><b>{m.name}</b><small>Merchant</small></span><ChevronDown size={17}/></button>
        </div>
      </header>
      <main className="content">
        <section className="greeting">
          <div><h1>{active==='Home'?<><span className="wave">👋</span> {greet}, <em>{m.name}</em></>:<><span className="wave">✦</span> {currentTitle}</>}</h1><p>{active==='Home'?"Here's what's happening with your business today.":`Manage your ${active.toLowerCase()} and keep your business moving.`}</p></div>
          <button className="add-product" onClick={()=>newProduct()}><Plus size={18}/> Add Product</button>
        </section>
        {active==='Home' ? <>
          <section className="metrics">
            <Metric icon={Wallet} title={`Sales · ${range}`} value={money(sum.sales)} note="confirmed payments" chart="yellow"/>
            <Metric icon={ShoppingBag} title="Orders" value={sum.count} note={range.toLowerCase()} chart="green"/>
            <Metric icon={Users} title="Customers" value={sum.customers} note={range.toLowerCase()} chart="purple"/>
            <Metric icon={Coins} title="Average order" value={money(sum.average)} note="paid orders" chart="none"/>
          </section>
          <section className="middle-grid">
            <div className="card sales-card">
              <div className="card-title"><h2>Sales Overview</h2><label className="range-select"><CalendarDays size={16}/><select value={range} onChange={e=>setRange(e.target.value)}><option>Today</option><option>This week</option><option>This month</option></select><ChevronDown size={14}/></label></div>
              <div className="sales-content"><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={sum.chart} margin={{top:10,right:4,left:-20,bottom:0}}><CartesianGrid stroke="#152b3d" vertical={false}/><XAxis dataKey="time" tick={{fill:'#b5c5d8',fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'#b5c5d8',fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:'#071521',border:'1px solid #274056',borderRadius:10,color:'#fff'}} cursor={{fill:'#142637'}}/><Bar dataKey="sales" fill="#ffc928" radius={[1,1,0,0]} maxBarSize={19}/></BarChart></ResponsiveContainer></div><div className="sales-stats"><div><small>Total Sales</small><strong>{money(sum.sales)}</strong></div><div><small>Total Orders</small><strong>{sum.count}</strong></div><div><small>Average Order Value</small><strong>{money(sum.average)}</strong></div></div></div>
            </div>
            <div className="card products-card"><div className="card-title"><h2>Top Products</h2><button className="text-link" onClick={()=>setActive('Products')}>View All <ArrowRight size={14}/></button></div>{products.map(p=><div className="product-row" key={p.name}><div className="product-image juice">📦</div><div className="product-info"><b>{p.name}</b><small>{p.sold} sold</small></div><strong>{money(p.revenue)}</strong></div>)}{!products.length&&<div className="empty">No paid sales yet.</div>}</div>
          </section>
          <section className="card orders-card">
            <div className="card-title"><h2>Recent Orders</h2><button className="text-link" onClick={()=>setActive('Orders')}>View All <ArrowRight size={14}/></button></div>
            <div className="table-wrap"><table><thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Time</th><th></th></tr></thead><tbody>{filteredOrders.map(o=><tr key={o.id}><td className="expand">›</td><td><div className="customer"><span className="avatar">{o.avatar}</span><span>{o.name}<small>{o.phone}</small></span></div></td><td>{o.items}</td><td>{o.amount}</td><td><span className="mpesa">▣</span> {o.payment}</td><td><Status status={o.status}/></td><td>{o.time}</td><td><button className="view-btn" onClick={()=>action(`Opened order ${o.id}`)}>View</button></td></tr>)}</tbody></table>{filteredOrders.length===0&&<div className="empty">{orders.length?'No matching orders found.':'No orders yet.'}</div>}</div>
          </section>
        </> : <section className="card section-view"><div className="section-head"><h2>{active}</h2><p>This workspace is ready for the {active.toLowerCase()} workflow.</p></div>{active==='Orders'&&<div className="filter-row">{['All','Pending','Paid','Ready for Pickup','Delivered','Cancelled'].map(f=><button className={ordersFilter===f?'chosen':''} onClick={()=>setOrdersFilter(f)} key={f}>{f}</button>)}</div>}{active==='Orders'?<div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Time</th><th></th></tr></thead><tbody>{filteredOrders.map(o=><tr key={o.id}><td>#{o.id}</td><td><div className="customer"><span className="avatar">{o.avatar}</span><span>{o.phone}</span></div></td><td>{o.items}</td><td>{o.amount}</td><td><Status status={o.status}/></td><td>{o.time}</td><td>{['Pending','Preparing'].includes(o.raw.status)&&!o.raw.rider_id?<><button className="view-btn" onClick={()=>prepare(o.id,'Ready for Pickup')}>Ready</button> <button className="view-btn" onClick={()=>prepare(o.id,'Cancelled')}>Cancel</button></>:null}</td></tr>)}</tbody></table>{!filteredOrders.length&&<div className="empty">No orders yet.</div>}</div>:active==='Products'?<div className="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>{data.products.map(p=><tr key={p.id}><td>{p.name}</td><td>{p.category}</td><td>{money(p.price_kes)}</td><td>{p.stock}</td><td><Status status={p.active?'Active':'Hidden'}/></td><td><button className="view-btn" onClick={()=>setProductForm({id:p.id,name:p.name,category:p.category,price_kes:p.price_kes,stock:p.stock,active:p.active})}>Edit</button></td></tr>)}</tbody></table>{!data.products.length&&<div className="empty">No products yet. Use Add Product.</div>}</div>:<div className="placeholder-grid"><div><Package/><b>{active} overview</b><span>Summary and activity will appear here.</span></div><div><TrendingUp/><b>Performance</b><span>Track trends and growth over time.</span></div><div><ShieldCheck/><b>Quick actions</b><span>Manage your business securely.</span></div></div>}</section>}
      </main>
    </div>
    <aside className="rightbar">
      <div className="right-top-space"><div className="decor-strip"></div><button className="add-product" onClick={()=>newProduct()}><Plus size={18}/> Add Product</button></div>
      <div className="card quick-card"><h2>Quick Actions</h2><div className="quick-grid"><Quick icon={Box} label="Add Product" onClick={()=>newProduct()}/><Quick icon={ClipboardList} label="View Orders" onClick={()=>setActive('Orders')}/><Quick icon={Share2} label="Share Store" onClick={()=>{navigator.clipboard?.writeText(window.location.href);action('Store link copied')}}/><Quick icon={LinkIcon} label="Get Payment Link" onClick={()=>action('Payment link flow is ready to connect')}/></div></div>
      <div className="card activity-card"><div className="card-title"><h2>Recent Activity</h2><button className="text-link" onClick={()=>setActive('Orders')}>View All <ArrowRight size={14}/></button></div>{activity.map(a=><div className="activity-row" key={a.id}><div className="activity-icon green"><ShoppingBag size={17}/></div><div className="activity-copy"><b>Order #{a.id}</b><small>{a.amount} · {a.time}</small></div><Status status={a.status}/></div>)}{!activity.length&&<div className="empty">No activity yet.</div>}</div>
      <div className="merchant-ad"><div className="ad-photo"><span>🌿</span><span>🥬</span><span>🍅</span></div><div className="ad-content"><div className="ad-brand"><span>🐝</span> Beez</div><h2>More sales,<br/><em>less hassle.</em></h2><p>Get paid instantly, track your orders and grow your business with Beez.</p><button onClick={()=>setActive('Analytics')}>Learn More <ArrowRight size={15}/></button></div></div>
      <div className="right-footer"><a onClick={()=>action('Help center opened')}>Help</a><span>|</span><a onClick={()=>action('Terms opened')}>Terms</a><span>|</span><a onClick={()=>action('Privacy opened')}>Privacy</a></div>
    </aside>
    {notice&&<div className="toast"><CheckCircle2 size={18}/>{notice}</div>}
    {productForm&&<div className="modal-backdrop" onClick={()=>setProductForm(null)}><div className="withdraw-modal" onClick={e=>e.stopPropagation()}><button className="modal-x" onClick={()=>setProductForm(null)}><X/></button><div className="metric-icon"><Box/></div><h2>{productForm.id?'Edit product':'Add product'}</h2><label>Name</label><input value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})}/><label>Category</label><input value={productForm.category} onChange={e=>setProductForm({...productForm,category:e.target.value})}/><label>Price (KES)</label><input inputMode="numeric" value={productForm.price_kes} onChange={e=>setProductForm({...productForm,price_kes:e.target.value.replace(/\D/g,'')})}/><label>Stock</label><input inputMode="numeric" value={productForm.stock} onChange={e=>setProductForm({...productForm,stock:e.target.value.replace(/\D/g,'')})}/><label><input type="checkbox" checked={productForm.active} onChange={e=>setProductForm({...productForm,active:e.target.checked})}/> Visible to customers</label><button className="primary-button" disabled={busy||!productForm.name.trim()||!productForm.category.trim()} onClick={saveProduct}>{busy?'Saving…':'Save product'}</button></div></div>}
  </div></div>;
}
function Metric({icon:Icon,title,value,note,chart}){return <div className="metric-card"><div className="metric-heading"><span className="metric-icon"><Icon size={20}/></span><span>{title}</span></div><strong>{value}</strong><div className="growth">{note}</div><svg className={`sparkline ${chart}`} viewBox="0 0 180 36" preserveAspectRatio="none"><path d={chart==='yellow'?'M2 31 L25 24 L42 27 L60 17 L75 20 L95 9 L110 18 L127 22 L143 16 L158 18 L178 4':chart==='green'?'M2 31 L25 24 L42 27 L60 17 L75 20 L95 9 L110 18 L127 22 L143 16 L158 18 L178 4':chart==='purple'?'M2 31 L25 28 L42 26 L60 21 L75 25 L95 14 L110 20 L127 12 L143 20 L158 13 L178 2':''} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/></svg></div>}
function Status({status}){return <span className={`status ${status.toLowerCase()}`}>{status}</span>}
function Quick({icon:Icon,label,onClick}){return <button className="quick-action" onClick={onClick}><Icon size={22}/><span>{label}</span></button>}
