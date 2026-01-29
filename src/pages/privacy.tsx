import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "wouter";

export default function Privacy() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-950/95 backdrop-blur-sm border-b border-gray-900 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/">
              <a className="flex items-center gap-3 group">
                <img 
                  src="/iqsion.logo.png" 
                  alt="IQsion" 
                  className="h-10 w-auto mix-blend-lighten"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all">IQsion</span>
              </a>
            </Link>
            <Link href="/">
              <a className="text-gray-400 hover:text-white transition-colors">
                ← {language === 'tr' ? 'Ana Sayfa' : 'Home'}
              </a>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{t('footerPrivacy')}</h1>
          
          <div className="prose prose-invert prose-blue max-w-none">
            {language === 'tr' ? (
              <>
                <div className="space-y-8">
                  <div>
                    <p className="text-gray-400 mb-4">
                      <strong>Son Güncelleme:</strong> 1 Ocak 2025
                    </p>
                    <p className="text-gray-400 mb-4">
                      <strong>İletişim:</strong>{' '}
                      <a href="mailto:contact@iqsion.com" className="text-blue-400 hover:text-blue-300">
                        contact@iqsion.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-300 leading-relaxed">
                      IQsion olarak kullanıcılarımızın gizliliğini korumayı en önemli önceliklerimizden biri olarak görüyoruz. 
                      Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını, saklandığını ve korunduğunu açıklar.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">1. Topladığımız Bilgiler</h3>
                    <p className="text-gray-300 mb-3">
                      IQsion'u kullanırken aşağıdaki bilgileri topluyoruz:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>Hesap bilgileri (ad, soyad, e-posta, şirket bilgileri)</li>
                      <li>Pazarlama platformu verileri (Google Ads, Meta Ads, TikTok, Shopify)</li>
                      <li>Kullanım verileri (platform etkileşimleri, tercihler)</li>
                      <li>Teknik veriler (IP adresi, tarayıcı türü, cihaz bilgileri)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">2. Bilgilerin Kullanımı</h3>
                    <p className="text-gray-300 mb-3">
                      Topladığımız verileri şu amaçlarla kullanırız:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>Platform hizmetlerini sağlamak ve optimize etmek</li>
                      <li>Yapay zeka destekli analizler ve öneriler sunmak</li>
                      <li>Müşteri desteği sağlamak</li>
                      <li>Platformu geliştirmek ve yeni özellikler eklemek</li>
                      <li>Yasal yükümlülükleri yerine getirmek</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">3. Veri Güvenliği</h3>
                    <p className="text-gray-300">
                      Verileriniz endüstri standardı şifreleme yöntemleriyle korunur. Google Cloud Platform altyapısını 
                      kullanarak verilerinizi güvenli bir şekilde saklarız. Yetkisiz erişimi önlemek için çok faktörlü 
                      kimlik doğrulama ve düzenli güvenlik denetimleri uygularız.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">4. Üçüncü Taraf Entegrasyonlar</h3>
                    <p className="text-gray-300">
                      Google Ads, Meta, TikTok ve Shopify gibi platformlarla entegrasyonlar OAuth 2.0 protokolü üzerinden 
                      güvenli bir şekilde gerçekleştirilir. Bu platformlardan aldığımız verileri yalnızca size analiz ve 
                      öneriler sunmak için kullanırız.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">5. Çerezler (Cookies)</h3>
                    <p className="text-gray-300">
                      Platform deneyiminizi geliştirmek için çerezler kullanırız. Çerez tercihlerinizi ayarlar 
                      sayfasından yönetebilirsiniz. Daha fazla bilgi için{' '}
                      <Link href="/cookies">
                        <a className="text-blue-400 hover:text-blue-300">Çerez Politikamıza</a>
                      </Link>{' '}
                      bakabilirsiniz.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">6. Haklarınız</h3>
                    <p className="text-gray-300 mb-3">
                      KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>Kişisel verilerinize erişme hakkı</li>
                      <li>Verilerinizi düzeltme veya güncelleme hakkı</li>
                      <li>Verilerinizin silinmesini talep etme hakkı</li>
                      <li>Veri işlemeye itiraz etme hakkı</li>
                      <li>Verilerinizi taşıma hakkı</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">7. İletişim</h3>
                    <p className="text-gray-300">
                      Gizlilik politikamızla ilgili sorularınız için lütfen bizimle iletişime geçin:{' '}
                      <a href="mailto:contact@iqsion.com" className="text-blue-400 hover:text-blue-300">
                        contact@iqsion.com
                      </a>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-8">
                  <div>
                    <p className="text-gray-400 mb-4">
                      <strong>Last Updated:</strong> January 1, 2025
                    </p>
                    <p className="text-gray-400 mb-4">
                      <strong>Contact:</strong>{' '}
                      <a href="mailto:contact@iqsion.com" className="text-blue-400 hover:text-blue-300">
                        contact@iqsion.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-300 leading-relaxed">
                      At IQsion, we consider protecting the privacy of our users as one of our top priorities. 
                      This Privacy Policy explains how your personal data is collected, used, stored, and protected.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h3>
                    <p className="text-gray-300 mb-3">
                      When using IQsion, we collect the following information:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>Account information (name, email, company details)</li>
                      <li>Marketing platform data (Google Ads, Meta Ads, TikTok, Shopify)</li>
                      <li>Usage data (platform interactions, preferences)</li>
                      <li>Technical data (IP address, browser type, device information)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">2. How We Use Information</h3>
                    <p className="text-gray-300 mb-3">
                      We use collected data for the following purposes:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>Provide and optimize platform services</li>
                      <li>Deliver AI-powered analytics and recommendations</li>
                      <li>Provide customer support</li>
                      <li>Improve the platform and add new features</li>
                      <li>Fulfill legal obligations</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">3. Data Security</h3>
                    <p className="text-gray-300">
                      Your data is protected with industry-standard encryption methods. We securely store your data 
                      using Google Cloud Platform infrastructure. We implement multi-factor authentication and regular 
                      security audits to prevent unauthorized access.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">4. Third-Party Integrations</h3>
                    <p className="text-gray-300">
                      Integrations with platforms like Google Ads, Meta, TikTok, and Shopify are securely conducted 
                      via OAuth 2.0 protocol. We use data from these platforms solely to provide you with analytics 
                      and recommendations.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">5. Cookies</h3>
                    <p className="text-gray-300">
                      We use cookies to enhance your platform experience. You can manage cookie preferences from 
                      the settings page. For more information, see our{' '}
                      <Link href="/cookies">
                        <a className="text-blue-400 hover:text-blue-300">Cookie Policy</a>
                      </Link>.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">6. Your Rights</h3>
                    <p className="text-gray-300 mb-3">
                      Under KVKK and GDPR, you have the following rights:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>Right to access your personal data</li>
                      <li>Right to correct or update your data</li>
                      <li>Right to request deletion of your data</li>
                      <li>Right to object to data processing</li>
                      <li>Right to data portability</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">7. Contact</h3>
                    <p className="text-gray-300">
                      For questions about our privacy policy, please contact us at{' '}
                      <a href="mailto:contact@iqsion.com" className="text-blue-400 hover:text-blue-300">
                        contact@iqsion.com
                      </a>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2025 IQsion. {language === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
}
