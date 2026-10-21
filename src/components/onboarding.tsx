import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, ShieldCheck, Check } from "lucide-react";

export function Shell({ onBack, children, step, total }: { onBack?: (() => void) | undefined; children: ReactNode; step?: number; total?: number }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-6">
        <div className="flex h-10 items-center justify-between">
          {onBack ? (
            <button onClick={onBack} aria-label="Back" className="rounded-full p-2 hover:bg-secondary"><ArrowLeft className="h-5 w-5" /></button>
          ) : (
            <Link to="/get-started" aria-label="Back" className="rounded-full p-2 hover:bg-secondary"><ArrowLeft className="h-5 w-5" /></Link>
          )}
          {total ? (
            <div className="flex gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <span key={i} className={`h-1.5 w-6 rounded-full ${i <= (step ?? 0) ? "bg-primary" : "bg-secondary"}`} />
              ))}
            </div>
          ) : null}
          <span className="w-9" />
        </div>
        <div className="mt-6 flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

export function Title({ t, d }: { t: string; d?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-extrabold">{t}</h1>
      {d && <p className="mt-2 text-muted-foreground">{d}</p>}
    </div>
  );
}

export function PrimaryBtn({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-primary-foreground transition hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100">
      {children} <ArrowRight className="h-4 w-4" />
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-sm text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const inputCls = "w-full rounded-xl border border-input bg-card px-4 py-3.5 outline-none focus:border-primary";

export const toE164 = (phone: string) => `+254${phone.replace(/\D/g, "").replace(/^0+/, "").replace(/^254/, "")}`;

export function PhoneStep({ title, desc, phone, setPhone, onNext, cta = "Continue", extra }: {
  title: string; desc: string; phone: string; setPhone: (v: string) => void; onNext: () => void; cta?: string; extra?: ReactNode;
}) {
  const valid = phone.replace(/\D/g, "").length >= 9;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const send = async () => {
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) });
    setBusy(false);
    if (error) setErr(error.message); else onNext();
  };
  return (
    <>
      <Title t={title} d={desc} />
      <div className="flex rounded-xl border border-input bg-card">
        <span className="flex items-center gap-2 border-r border-input px-4 text-sm">🇰🇪 +254</span>
        <input inputMode="tel" placeholder="712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)}
          className="flex-1 bg-transparent px-4 py-3.5 outline-none" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">This number will be used for payments, orders and account recovery.</p>
      {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
      <div className="mt-8"><PrimaryBtn onClick={send} disabled={!valid || busy}>{busy ? "Sending…" : cta}</PrimaryBtn></div>
      {extra}
      <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Your information is safe with Beez.</p>
    </>
  );
}

export function OtpStep({ title, phone, onNext, cta = "Verify" }: { title: string; phone: string; onNext: () => void; cta?: string }) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [secs, setSecs] = useState(45);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const verify = async () => {
    setBusy(true); setErr("");
    const { error } = await supabase.auth.verifyOtp({ phone: toE164(phone), token: code.join(""), type: "sms" });
    setBusy(false);
    if (error) setErr(error.message); else onNext();
  };
  const resend = async () => {
    setSecs(45); setErr("");
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) });
    if (error) setErr(error.message);
  };
  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  const set = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...code]; next[i] = d; setCode(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
  return (
    <>
      <Title t={title} d={<>We've sent a 6-digit code to<br />+254 {phone}</>} />
      <div className="flex justify-between gap-2">
        {code.map((c, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} value={c} inputMode="numeric" maxLength={1}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === "Backspace" && !c && i > 0) refs.current[i - 1]?.focus(); }}
            className="h-14 w-12 rounded-xl border border-input bg-card text-center text-xl font-bold outline-none focus:border-primary" />
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Didn't receive the code?{" "}
        {secs > 0 ? <span className="text-primary">Resend in 00:{String(secs).padStart(2, "0")}</span>
          : <button onClick={resend} className="font-semibold text-primary">Resend</button>}
      </p>
      {err && <p className="mt-4 text-center text-sm text-destructive">{err}</p>}
      <div className="mt-8"><PrimaryBtn onClick={verify} disabled={code.join("").length < 6 || busy}>{busy ? "Verifying…" : cta}</PrimaryBtn></div>
    </>
  );
}

export function DoneStep({ title, desc, to, children }: { title: string; desc: string; to: "/merchant/dashboard" | "/rider/dashboard"; children?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      {children ?? (
        <span className="grid h-24 w-24 place-items-center rounded-full border-4 border-primary">
          <Check className="h-12 w-12 text-primary" strokeWidth={3} />
        </span>
      )}
      <h1 className="mt-8 text-3xl font-extrabold">{title}</h1>
      <p className="mt-3 text-muted-foreground">{desc}</p>
      <Link to={to} className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-primary-foreground">
        Go to Dashboard <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function OptionCard({ active, onClick, icon, t, d }: { active: boolean; onClick: () => void; icon?: ReactNode; t: string; d: string }) {
  return (
    <button onClick={onClick}
      className={`mb-3 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}>
      {icon ?? (
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${active ? "border-primary bg-primary" : "border-muted-foreground"}`}>
          {active && <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />}
        </span>
      )}
      <span><span className="block font-semibold">{t}</span><span className="text-sm text-muted-foreground">{d}</span></span>
    </button>
  );
}
