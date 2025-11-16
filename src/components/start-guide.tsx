import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useLanguage } from "../contexts/LanguageContext";

// Lightweight onboarding wizard with 3 steps: connections, pixel, profile
export default function StartGuide({ open, onOpenChange, userId }: { open: boolean; onOpenChange: (v: boolean)=>void; userId?: string; }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<1|2|3>(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [pixelInfo, setPixelInfo] = useState<{ pixelId?: string; scriptUrl?: string; lastSeenAt?: number | null } | null>(null);
  // Profile form
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [avgOrder, setAvgOrder] = useState<string>("");
  const [grossMargin, setGrossMargin] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  const fetchStatus = async () => {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const [onb, px] = await Promise.all([
      fetch(`/api/onboarding/status${qs}`).then(r=>r.json()).catch(()=>null),
      fetch(`/api/pixel/status${qs}`).then(r=>r.json()).catch(()=>null)
    ]);
    setStatus(onb);
    if (px?.hasPixel) setPixelInfo({ pixelId: px.pixelId, scriptUrl: px.scriptUrl, lastSeenAt: px.lastSeenAt });
  };

  useEffect(()=>{ if (open) fetchStatus(); }, [open]);

  const allConnectionsOk = !!status?.connections && (
    status.connections.shopify || status.connections.google_analytics || status.connections.meta_ads || status.connections.google_ads
  );
  const pixelOk = !!pixelInfo?.lastSeenAt; // seen at least once

  const handleGeneratePixel = async () => {
    setLoading(true);
    try {
      const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
      const j = await fetch(`/api/pixel/create${qs}`, { method: 'POST' }).then(r=>r.json());
      setPixelInfo({ pixelId: j.pixelId, scriptUrl: j.scriptUrl, lastSeenAt: j.lastSeenAt });
    } finally { setLoading(false); }
  };

  const handleVerifyPixel = async () => {
    setLoading(true);
    try {
      await new Promise(r=>setTimeout(r, 1000));
      await fetchStatus();
    } finally { setLoading(false); }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
      const payload: any = { industry, companySize, avgOrderValue: Number(avgOrder||0), grossMargin: Number(grossMargin||0), targetCountry: country };
      await fetch(`/api/brand-profile${qs}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      onOpenChange(false);
      localStorage.setItem('iq_onboarding_completed', '1');
    } finally { setLoading(false); }
  };

  const canNext = useMemo(()=>{
    if (step===1) return allConnectionsOk;
    if (step===2) return !!pixelInfo?.pixelId; // allow next after generating, verify is optional
    return true;
  }, [step, allConnectionsOk, pixelInfo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-slate-900 text-white border border-slate-700">
        <DialogHeader>
          <DialogTitle>{t('onboardingStart')}</DialogTitle>
          <DialogDescription className="text-slate-400">{t('onboardingIntro')}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-6">
          {/* Stepper */}
          <div className="flex items-center gap-2 text-sm">
            {[1,2,3].map((s)=> (
              <div key={s} className={`px-3 py-1 rounded-full ${step===s? 'bg-blue-600 text-white':'bg-slate-700 text-slate-300'}`}>Step {s}</div>
            ))}
          </div>

          {step===1 && (
            <div className="space-y-3">
              <div className="text-lg font-semibold">{t('stepConnectionsTitle')}</div>
              <div className="text-slate-300">{t('stepConnectionsDesc')}</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <ConnCard label="Shopify" ok={!!status?.connections?.shopify} href="/settings?connect=shopify" />
                <ConnCard label="Google Analytics" ok={!!status?.connections?.google_analytics} href="/settings?connect=ga" />
                <ConnCard label="Meta Ads" ok={!!status?.connections?.meta_ads} href="/settings?connect=meta" />
                <ConnCard label="Google Ads" ok={!!status?.connections?.google_ads} href="/settings?connect=gads" />
              </div>
            </div>
          )}

          {step===2 && (
            <div className="space-y-4">
              <div className="text-lg font-semibold">{t('stepPixelTitle')}</div>
              <div className="text-slate-300">{t('stepPixelDesc')}</div>
              {!pixelInfo?.pixelId ? (
                <Button disabled={loading} onClick={handleGeneratePixel} className="bg-blue-600 hover:bg-blue-700">{t('generatePixel')}</Button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">&lt;script&gt; snippet</div>
                    <Textarea readOnly value={`<script src="${pixelInfo.scriptUrl}"></script>`} className="bg-slate-800 border-slate-700 text-white" />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={()=>navigator.clipboard.writeText(`<script src="${pixelInfo!.scriptUrl}"></script>`)} variant="secondary">{t('copySnippet')}</Button>
                      <Button onClick={handleVerifyPixel} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">{t('verifyPixel')}</Button>
                    </div>
                  </div>
                  <div className="text-sm">
                    {pixelInfo?.lastSeenAt ? (
                      <span className="text-emerald-400">{t('pixelInstalled')} • {new Date(pixelInfo.lastSeenAt).toLocaleString()}</span>
                    ) : (
                      <span className="text-yellow-400">{t('pixelNotSeen')}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step===3 && (
            <div className="space-y-4">
              <div className="text-lg font-semibold">{t('stepProfileTitle')}</div>
              <div className="text-slate-300">{t('stepProfileDesc')}</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-400 mb-1">{t('companySector')}</div>
                  <Input value={industry} onChange={(e)=>setIndustry(e.target.value)} placeholder="Örn: Moda, Elektronik" className="bg-slate-800 border-slate-700" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">{t('companySize')}</div>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue placeholder="1-10, 11-50, 51-200..." /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {['1-10','11-50','51-200','200+'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">{t('avgOrderValue')}</div>
                  <Input value={avgOrder} onChange={(e)=>setAvgOrder(e.target.value)} placeholder="₺" className="bg-slate-800 border-slate-700" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">{t('grossMargin')}</div>
                  <Input value={grossMargin} onChange={(e)=>setGrossMargin(e.target.value)} placeholder="%" className="bg-slate-800 border-slate-700" />
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-400 mb-1">{t('targetCountry')}</div>
                  <Input value={country} onChange={(e)=>setCountry(e.target.value)} placeholder="Örn: TR, US, DE" className="bg-slate-800 border-slate-700" />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between gap-2 mt-4">
          <div className="flex items-center gap-2">
            {/* Don't show again - persists locally */}
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-slate-200"
              onClick={() => {
                try { localStorage.setItem('iq_onboarding_hide', '1'); } catch {}
                onOpenChange(false);
              }}
            >
              {t('dontShowAgain')}
            </Button>
            {step>1 && <Button variant="secondary" onClick={()=>setStep((s)=> (s-1) as any)}>{t('previous')}</Button>}
          </div>
          <div className="flex gap-2">
            {step<3 && <Button disabled={!canNext} onClick={()=>setStep((s)=> (s+1) as any)}>{t('next')}</Button>}
            {step===3 && <Button disabled={loading} onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">{t('finish')}</Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ConnCard = ({ label, ok, href }: { label: string; ok: boolean; href: string }) => (
  <a href={href} className={`border rounded-lg p-3 block ${ok ? 'border-emerald-600 bg-emerald-500/10' : 'border-slate-700 bg-slate-800 hover:bg-slate-800/80'}`}>
    <div className="text-white font-medium">{label}</div>
    <div className={`text-xs ${ok ? 'text-emerald-400' : 'text-slate-400'}`}>{ok ? 'Bağlandı' : 'Bağlan'}</div>
  </a>
);
