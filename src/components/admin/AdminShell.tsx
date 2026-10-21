import { useEffect, useState, type ReactNode, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import type { Session } from '@supabase/supabase-js';
import {
  Home, ShoppingBag, Users, Store, Bike, Package, Truck, CreditCard, BarChart3, Headphones, Settings, Search, Bell, LogOut,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { db, useTable, type Ticket } from '@/lib/admin-data';
import '@/routes/-admin-dashboard.css';

const nav = [
  [Home, 'Dashboard', '/admin/dashboard'], [ShoppingBag, 'Orders', '/admin/orders'], [Users, 'Customers', '/admin/customers'],
  [Store, 'Merchants', '/admin/merchants'], [Bike, 'Riders', '/admin/riders'], [Package, 'Products', '/admin/products'],
  [Truck, 'Deliveries', '/admin/deliveries'], [CreditCard, 'Payments', '/admin/payments'], [BarChart3, 'Reports', '/admin/reports'],
  [Headphones, 'Support', '/admin/support'], [Settings, 'Settings', '/admin/settings'],
] as const;

type Gate = 'loading' | 'signed-out' | 'denied' | 'admin';

export function AdminGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [gate, setGate] = useState<Gate>('loading');

  useEffect(() => {
    const check = async (s: Session | null) => {
      setSession(s);
      if (!s) return setGate('signed-out');
      const { data } = await db.rpc('claim_first_admin');
      setGate(data ? 'admin' : 'denied');
    };
    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') void check(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (gate === 'loading') return <div className="ad ad-center"><p className="ad-muted">Loading admin…</p></div>;
  if (gate === 'signed-out') return <AdminLogin />;
  if (gate === 'denied') return (
    <div className="ad ad-center"><div className="ad-card ad-login">
      <h1>No admin access</h1>
      <p className="ad-muted">{session?.user.email} is not an admin. Ask an existing admin to give you access.</p>
      <button className="ad-btn" onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div></div>
  );
  return <AdminLayout email={session?.user.email ?? ''}>{children}</AdminLayout>;
}

function AdminLogin() {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    const res = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` } });
    if (res.error) setMsg(res.error.message);
    else if (mode === 'up' && !res.data.session) setMsg('Check your email to confirm your account, then sign in.');
    setBusy(false);
  };
  return (
    <div className="ad ad-center">
      <form className="ad-card ad-login" onSubmit={submit}>
        <div className="ad-logo"><span className="ad-bee">🐝</span>Beez Admin</div>
        <h1>{mode === 'in' ? 'Sign in' : 'Create admin account'}</h1>
        <label>Email<input className="ad-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input className="ad-input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {msg && <p className="ad-msg">{msg}</p>}
        <button className="ad-btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}</button>
        <button type="button" className="ad-link" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
          {mode === 'in' ? 'No account yet? Create one' : 'Have an account? Sign in'}
        </button>
        <p className="ad-muted xs">The first account to sign in becomes the admin.</p>
      </form>
    </div>
  );
}

function AdminLayout({ email, children }: { email: string; children: ReactNode }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const { rows: tickets } = useTable<Ticket>('support_tickets');
  const open = tickets.filter((t) => t.status === 'Open').length;
  return (
    <div className="ad">
      <aside className="ad-side">
        <div className="ad-logo"><span className="ad-bee">🐝</span>Beez</div>
        <nav>{nav.map(([I, n, to]) => (
          <Link key={n} to={to} activeProps={{ className: 'active' }}><I size={19} /><span>{n}</span></Link>
        ))}</nav>
        <div className="ad-side-foot"><span className="ad-bee sm">🐝</span><div><b>Beez</b><p>Fast. Safe. Local.</p></div></div>
      </aside>
      <div className="ad-main">
        <header className="ad-top">
          <form className="ad-search" onSubmit={(e) => { e.preventDefault(); navigate({ to: '/admin/orders', search: { q } }); }}>
            <Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders, customers, or order IDs..." />
          </form>
          <div className="ad-top-r">
            <Link to="/admin/support" className="ad-bell" aria-label="Open support tickets"><Bell size={20} />{open > 0 && <i>{open}</i>}</Link>
            <div className="ad-user">
              <span className="ad-av-txt">{email.slice(0, 1).toUpperCase()}</span>
              <div><b>{email}</b><p>Admin</p></div>
              <button aria-label="Sign out" onClick={async () => { await supabase.auth.signOut(); }}><LogOut size={16} /></button>
            </div>
          </div>
        </header>
        <div className="ad-body">{children}</div>
      </div>
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return <div className="ad-welcome"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{action}</div>;
}
