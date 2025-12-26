import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Loader2, CheckCircle, Database, Clock, Archive } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface Account {
  id: string;
  name: string;
}

interface AccountSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (accountId: string, accountName: string, ingestDays: number, retentionDays: number) => void;
  platformName: string;
  platformId: string;
  accounts: Account[];
  isLoadingAccounts: boolean;
}

export function AccountSelectionDialog({
  open,
  onClose,
  onConfirm,
  platformName,
  platformId,
  accounts,
  isLoadingAccounts,
}: AccountSelectionDialogProps) {
  const { t } = useLanguage();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [manualAccountId, setManualAccountId] = useState<string>("");
  const [useManualInput, setUseManualInput] = useState<boolean>(false);
  const [ingestDays, setIngestDays] = useState<string>("30");
  const [retentionDays, setRetentionDays] = useState<string>("90");

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedAccountId("");
      setManualAccountId("");
      setUseManualInput(false);
      setIngestDays("30");
      setRetentionDays("90");
    }
  }, [open]);

  // Eğer hesap listesi boşsa ve Google Ads ise, otomatik manuel moda geç
  useEffect(() => {
    if (open && !isLoadingAccounts && accounts.length === 0 && platformId === 'google_ads') {
      setUseManualInput(true);
    }
  }, [open, isLoadingAccounts, accounts.length, platformId]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const handleConfirm = () => {
    if (useManualInput) {
      // Manuel giriş modunda
      if (!manualAccountId.trim()) return;
      onConfirm(manualAccountId.trim(), manualAccountId.trim(), Number(ingestDays), Number(retentionDays));
    } else {
      // Normal seçim modunda
      if (!selectedAccountId || !selectedAccount) return;
      onConfirm(selectedAccountId, selectedAccount.name, Number(ingestDays), Number(retentionDays));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            {platformName} Bağlantısı Başarılı!
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Lütfen veri çekmek istediğiniz hesabı seçin. Seçim yaptıktan sonra veriler otomatik olarak çekilecektir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Hesap Seçimi */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Database className="w-4 h-4 text-blue-400" />
              Hesap Seçin
            </label>
            {isLoadingAccounts ? (
              <div className="flex items-center gap-2 text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Hesaplar yükleniyor...
              </div>
            ) : accounts.length === 0 ? (
              <div className="space-y-2">
                <div className="text-amber-400 text-sm py-2">
                  Bu platforma bağlı hesap bulunamadı.
                </div>
                {/* Google Ads için manuel giriş */}
                {platformId === 'google_ads' && (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Hesap ID'sini girin (örn: 123-456-7890)"
                      value={manualAccountId}
                      onChange={(e) => setManualAccountId(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    />
                    <p className="text-xs text-slate-500">
                      Google Ads hesap ID'nizi Google Ads arayüzünden bulabilirsiniz.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Hesap seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 max-h-64 overflow-auto">
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name || acc.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Google Ads için manuel giriş seçeneği */}
                {platformId === 'google_ads' && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setUseManualInput(true)}
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto text-xs"
                  >
                    Manuel olarak hesap ID'si gir
                  </Button>
                )}
              </>
            )}
            
            {/* Manuel giriş modu (listede hesap varsa ama manuel seçilirse) */}
            {useManualInput && accounts.length > 0 && (
              <div className="space-y-2 mt-2">
                <Input
                  type="text"
                  placeholder="Hesap ID'sini girin (örn: 123-456-7890)"
                  value={manualAccountId}
                  onChange={(e) => setManualAccountId(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setUseManualInput(false)}
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto text-xs"
                >
                  ← Listeden seç
                </Button>
              </div>
            )}
          </div>

          {/* Veri Çekme Süresi */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Clock className="w-4 h-4 text-blue-400" />
              Çekilecek Veri Aralığı
            </label>
            <Select value={ingestDays} onValueChange={setIngestDays}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Süre seçin" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="7">Son 7 gün</SelectItem>
                <SelectItem value="14">Son 14 gün</SelectItem>
                <SelectItem value="30">Son 30 gün</SelectItem>
                <SelectItem value="60">Son 60 gün</SelectItem>
                <SelectItem value="90">Son 90 gün</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Seçtiğiniz süreye göre veri çekme işlemi 1-3 dakika sürebilir.
            </p>
          </div>

          {/* Veri Saklama Süresi */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Archive className="w-4 h-4 text-purple-400" />
              Veri Saklama Süresi
            </label>
            <Select value={retentionDays} onValueChange={setRetentionDays}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Süre seçin" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="30">30 gün</SelectItem>
                <SelectItem value="60">60 gün</SelectItem>
                <SelectItem value="90">90 gün</SelectItem>
                <SelectItem value="180">6 ay</SelectItem>
                <SelectItem value="365">1 yıl</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Bu süreden eski veriler otomatik olarak silinir.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            İptal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isLoadingAccounts || 
              (useManualInput ? !manualAccountId.trim() : !selectedAccountId)
            }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Hesabı Seç ve Verileri Çek
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
