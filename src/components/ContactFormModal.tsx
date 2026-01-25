import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'demo' | 'contact';
}

export default function ContactFormModal({ open, onOpenChange, type = 'contact' }: ContactFormModalProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
      onOpenChange(false);
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent">
            {type === 'demo' ? t('contactFormDemoTitle') : t('contactFormContactTitle')}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {type === 'demo' 
              ? t('contactFormDemoDesc')
              : t('contactFormContactDesc')}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t('contactFormSuccessTitle')}</h3>
            <p className="text-gray-400">{t('contactFormSuccessDesc')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">{t('contactFormName')} *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder={t('contactFormNamePlaceholder')}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">{t('contactFormEmail')} *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('contactFormEmailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-gray-300">{t('contactFormCompany')}</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder={t('contactFormCompanyPlaceholder')}
                  value={formData.company}
                  onChange={handleChange}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">{t('contactFormPhone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder={t('contactFormPhonePlaceholder')}
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-300">
                {type === 'demo' ? t('contactFormMessageDemo') : t('contactFormMessageContact') + ' *'}
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder={type === 'demo' 
                  ? t('contactFormMessageDemoPlaceholder')
                  : t('contactFormMessageContactPlaceholder')}
                value={formData.message}
                onChange={handleChange}
                required={type === 'contact'}
                rows={4}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {t('contactFormCancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white font-semibold shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('contactFormSending')}
                  </>
                ) : (
                  t('contactFormSend')
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
