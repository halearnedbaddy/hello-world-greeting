import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Store, Camera } from "lucide-react";
import { Shell, Title, PrimaryBtn, Field, inputCls, PhoneStep, OtpStep, DoneStep, OptionCard } from "@/components/onboarding";
import { saveMerchant } from "@/lib/merchant.functions";

export const Route = createFileRoute("/onboarding/merchant")({
  head: () => ({
    meta: [
      { title: "Merchant sign up | Beez" },
      { name: "description", content: "Set up your Beez merchant account in a few quick steps." },
      { property: "og:title", content: "Become a Beez merchant" },
      { property: "og:description", content: "Sell more, get paid faster with Beez." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MerchantOnboarding,
});

const locations: Record<string, Record<string, string[]>> = {
  Nairobi: { Westlands: ["Parklands", "Kangemi"], Kasarani: ["Roysambu", "Mwiki"] },
  Mombasa: { Mvita: ["Kizingo", "Old Town"], Nyali: ["Kongowea", "Mkomani"] },
  Kisumu: { "Kisumu Central": ["Milimani", "Kondele"] },
};
const TOTAL = 7;

function MerchantOnboarding() {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [sells, setSells] = useState("");
  const [type, setType] = useState("sole");
  const [county, setCounty] = useState("Mombasa");
  const [sub, setSub] = useState("Mvita");
  const [area, setArea] = useState("Kizingo");
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const next = () => setStep((s) => s + 1);
  const back = step > 0 && step < TOTAL - 1 ? () => setStep((s) => s - 1) : undefined;

  return (
    <Shell onBack={back} step={step} total={TOTAL}>
      {step === 0 && <PhoneStep title="Enter your phone number" desc="We'll send you a verification code to get you started." phone={phone} setPhone={setPhone} onNext={next} />}
      {step === 1 && <OtpStep title="Verify your number" phone={phone} onNext={next} />}
      {step === 2 && (
        <>
          <div className="mb-8 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/15"><Store className="h-8 w-8 text-primary" /></span>
            <h1 className="mt-4 text-3xl font-extrabold">Your Business</h1>
            <p className="mt-2 text-muted-foreground">Let's set up your business details.</p>
          </div>
          <Field label="Business name"><input className={inputCls} placeholder="Mama's Kitchen" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="What do you sell? (e.g. food, groceries, clothes)"><input className={inputCls} placeholder="Food & Drinks" value={sells} onChange={(e) => setSells(e.target.value)} /></Field>
          <div className="mt-4"><PrimaryBtn onClick={next} disabled={!name.trim() || !sells.trim()}>Continue</PrimaryBtn></div>
        </>
      )}
      {step === 3 && (
        <>
          <Title t="Business type" d="Choose the type that best describes your business." />
          <OptionCard active={type === "sole"} onClick={() => setType("sole")} t="Sole Proprietor" d="Individual owner (no registration required)" />
          <OptionCard active={type === "reg"} onClick={() => setType("reg")} t="Registered Business" d="Company or Limited Liability" />
          <OptionCard active={type === "other"} onClick={() => setType("other")} t="Other" d="Cooperative, group, etc." />
          <div className="mt-6"><PrimaryBtn onClick={next}>Continue</PrimaryBtn></div>
        </>
      )}
      {step === 4 && (
        <>
          <Title t="Business location" d="Where is your business based?" />
          <Field label="County">
            <select className={inputCls} value={county} onChange={(e) => { const c = e.target.value; const s = Object.keys(locations[c] ?? {})[0] ?? ""; setCounty(c); setSub(s); setArea(locations[c]?.[s]?.[0] ?? ""); }}>
              {Object.keys(locations).map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Sub-county">
            <select className={inputCls} value={sub} onChange={(e) => { setSub(e.target.value); setArea(locations[county]?.[e.target.value]?.[0] ?? ""); }}>
              {Object.keys(locations[county] ?? {}).map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Location / Area">
            <select className={inputCls} value={area} onChange={(e) => setArea(e.target.value)}>
              {(locations[county]?.[sub] ?? []).map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <div className="mt-4"><PrimaryBtn onClick={next}>Continue</PrimaryBtn></div>
        </>
      )}
      {step === 5 && (
        <>
          <Title t="Add a profile photo" d="Help customers recognize your business." />
          <label className="mx-auto grid h-40 w-40 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-primary/60 bg-card">
            {photo ? <img src={photo} alt="Profile" className="h-full w-full object-cover" /> : (
              <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground"><Camera className="h-7 w-7 text-primary" />Tap to upload</span>
            )}
            <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />
          </label>
          <p className="mt-4 text-center text-xs text-muted-foreground">JPG, PNG • Max 5MB</p>
          {saveError && <p className="mt-4 text-center text-sm text-destructive">{saveError}</p>}
          <div className="mt-10"><PrimaryBtn disabled={saving} onClick={async () => {
            setSaving(true); setSaveError("");
            try { await saveMerchant({ data: { name: name.trim(), area: `${area}, ${sub}, ${county}`, phone, category: sells.trim(), business_type: type } }); next(); }
            catch (e) { setSaveError(e instanceof Error ? e.message : "Could not save. Please try again."); }
            finally { setSaving(false); }
          }}>{saving ? "Saving…" : photo ? "Continue" : "Skip for now"}</PrimaryBtn></div>
        </>
      )}
      {step === 6 && <DoneStep title="You're all set!" desc="Your Beez merchant account is ready. Start selling and receiving payments." to="/merchant/dashboard" />}
    </Shell>
  );
}
