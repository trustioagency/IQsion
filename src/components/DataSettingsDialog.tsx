import React, { useState } from "react";
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
import { Database, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface DataSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (settings: { initialIngestDays: number; retentionDays: number }) => void;
  platformName: string;
  mode: 'connect' | 'change'; // ilk bağlantı mı yoksa hesap değişikliği mi
  currentAccountName?: string; // değiştirilecek hesap adı (varsa)
  newAccountName?: string; // yeni seçilen hesap adı (varsa)
}

export function DataSettingsDialog({
  open,
  onClose,
  onConfirm,
  platformName,
  mode,
  currentAccountName,
  newAccountName,
}: DataSettingsDialogProps) {
  const { t } = useLanguage();
  const [initialIngestDays, setInitialIngestDays] = useState<string>("30");
  const [retentionDays, setRetentionDays] = useState<string>("90");

  const handleConfirm = () => {
    onConfirm({
      initialIngestDays: Number(initialIngestDays),
      retentionDays: Number(retentionDays),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            {mode === 'connect' 
              ? `${platformName} Veri Ayarları`
              : `${platformName} Hesap Değişikliği`
            }
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {mode === 'connect' ? (
              <>Bağlantı yapmadan önce veri çekme ayarlarını belirleyin.</>
            ) : (
              <>
                {currentAccountName && (
                  <span className="block mb-2">
                    <span className="text-slate-500">Mevcut hesap:</span>{" "}
                    <span className="text-red-400">{currentAccountName}</span>
                  </span>
                )}
                {newAccountName && (
                  <span className="block mb-2">
                    <span className="text-slate-500">Yeni hesap:</span>{" "}
                    <span className="text-green-400">{newAccountName}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-amber-400 text-xs mt-2">
                  <AlertCircle className="w-3 h-3" />
                  Mevcut hesabın tüm verileri silinecek
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* İlk veri çekme süresi */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Clock className="w-4 h-4 text-blue-400" />
              İlk bağlantıda çekilecek veri
            </label>
            <Select value={initialIngestDays} onValueChange={setInitialIngestDays}>
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
              Platform bağlandığında bu kadar geriye dönük veri çekilecek
            </p>
          </div>

          {/* Veri saklama süresi */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Database className="w-4 h-4 text-green-400" />
              BigQuery'de saklanacak süre
            </label>
            <Select value={retentionDays} onValueChange={setRetentionDays}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Süre seçin" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="30">30 gün</SelectItem>
                <SelectItem value="60">60 gün</SelectItem>
                <SelectItem value="90">90 gün</SelectItem>
                <SelectItem value="180">180 gün</SelectItem>
                <SelectItem value="365">1 yıl</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Bu süreden eski veriler otomatik silinecek
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
          >
            İptal
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {mode === 'connect' ? 'Bağlan' : 'Değiştir ve Veri Çek'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DataSettingsDialog;
