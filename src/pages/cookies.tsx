import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "wouter";

export default function Cookies() {
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
          <h1 className="text-4xl font-bold mb-8">{t('footerCookies')}</h1>
          
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
                    <h3 className="text-lg font-semibold text-white mb-3">1. Çerezler Nedir?</h3>
                    <p className="text-gray-300">
                      Çerezler, web sitelerini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. 
                      Çerezler, web sitesinin işlevselliğini artırmak, kullanıcı deneyimini geliştirmek ve 
                      site kullanımını analiz etmek için kullanılır.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">2. Kullandığımız Çerez Türleri</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-white mb-2">Zorunlu Çerezler</h4>
                        <p className="text-gray-300 mb-2">
                          Platformun temel işlevlerini yerine getirmek için gereklidir. 
                          Bu çerezler devre dışı bırakılamaz.
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                          <li>Oturum yönetimi</li>
                          <li>Güvenlik ve kimlik doğrulama</li>
                          <li>Form gönderimi</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-2">Performans Çerezleri</h4>
                        <p className="text-gray-300 mb-2">
                          Platform performansını izlemek ve iyileştirmek için kullanılır:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                          <li>Sayfa yükleme süreleri</li>
                          <li>Hata raporlama</li>
                          <li>Kullanım istatistikleri</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-2">İşlevsellik Çerezleri</h4>
                        <p className="text-gray-300 mb-2">
                          Tercihlerinizi hatırlamak için kullanılır:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                          <li>Dil tercihi</li>
                          <li>Dashboard düzeni</li>
                          <li>Bildirim ayarları</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-2">Analitik Çerezleri</h4>
                        <p className="text-gray-300 mb-2">
                          Platform kullanımını anlamak için kullanılır:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                          <li>Google Analytics (anonim)</li>
                          <li>Özellik kullanım istatistikleri</li>
                          <li>Kullanıcı yolculuğu analizi</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">3. Üçüncü Taraf Çerezleri</h3>
                    <p className="text-gray-300 mb-3">
                      Aşağıdaki üçüncü taraf hizmetler çerez kullanabilir:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li><strong>Google Analytics:</strong> Anonim kullanım istatistikleri</li>
                      <li><strong>Google Ads API:</strong> Reklam verilerini çekmek için</li>
                      <li><strong>Meta Pixel:</strong> Meta Ads entegrasyonu için</li>
                      <li><strong>TikTok Pixel:</strong> TikTok Ads entegrasyonu için</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">4. Çerez Yönetimi</h3>
                    <p className="text-gray-300 mb-3">
                      Çerez tercihlerinizi aşağıdaki yöntemlerle yönetebilirsiniz:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li><strong>Platform Ayarları:</strong> Dashboard'daki ayarlar menüsünden çerez tercihlerinizi değiştirebilirsiniz</li>
                      <li><strong>Tarayıcı Ayarları:</strong> Çoğu tarayıcı, çerezleri yönetmek için araçlar sunar</li>
                      <li><strong>Gizli Mod:</strong> Tarayıcınızın gizli modunda oturum çerezleri silinir</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">5. Çerez Saklama Süreleri</h3>
                    <p className="text-gray-300 mb-3">
                      Farklı çerez türleri için farklı saklama süreleri uygulanır:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li><strong>Oturum Çerezleri:</strong> Tarayıcı kapatılınca silinir</li>
                      <li><strong>Kalıcı Çerezler:</strong> 1 yıl</li>
                      <li><strong>Analitik Çerezler:</strong> 2 yıl</li>
                      <li><strong>Tercih Çerezleri:</strong> 1 yıl</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">6. Çerezleri Reddetme</h3>
                    <p className="text-gray-300">
                      Çerezleri tamamen reddetmeyi seçebilirsiniz, ancak bu durumda platformun bazı özellikleri 
                      düzgün çalışmayabilir. Zorunlu çerezler, platform işlevselliği için gerekli olduğundan 
                      devre dışı bırakılamaz.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">7. Güncellemeler</h3>
                    <p className="text-gray-300">
                      Bu çerez politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda 
                      platform üzerinden bildirim yapılacaktır.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">8. İletişim</h3>
                    <p className="text-gray-300">
                      Çerez politikamızla ilgili sorularınız için:{' '}
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
                    <h3 className="text-lg font-semibold text-white mb-3">1. What are Cookies?</h3>
                    <p className="text-gray-300">
                      Cookies are small text files saved to your device when you visit websites. 
                      Cookies are used to enhance website functionality, improve user experience, 
                      and analyze site usage.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">2. Types of Cookies We Use</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-white mb-2">Essential Cookies</h4>
                        <p className="text-gray-300 mb-2">
                          Required for the platform's core functions. 
                          These cookies cannot be disabled.
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                          <li>Session management</li>
                          <li>Security and authentication</li>
                          <li>Form submission</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-2">Performance Cookies</h4>
                        <p className="text-gray-300 mb-2">
                          Used to monitor and improve platform performance:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                          <li>Page load times</li>
                          <li>Error reporting</li>
                          <li>Usage statistics</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-2">Functionality Cookies</h4>
                        <p className="text-gray-300 mb-2">
                          Used to remember your preferences:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                          <li>Language preference</li>
                          <li>Dashboard layout</li>
                          <li>Notification settings</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-2">Analytics Cookies</h4>
                        <p className="text-gray-300 mb-2">
                          Used to understand platform usage:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                          <li>Google Analytics (anonymous)</li>
                          <li>Feature usage statistics</li>
                          <li>User journey analysis</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">3. Third-Party Cookies</h3>
                    <p className="text-gray-300 mb-3">
                      The following third-party services may use cookies:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li><strong>Google Analytics:</strong> Anonymous usage statistics</li>
                      <li><strong>Google Ads API:</strong> To fetch advertising data</li>
                      <li><strong>Meta Pixel:</strong> For Meta Ads integration</li>
                      <li><strong>TikTok Pixel:</strong> For TikTok Ads integration</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">4. Cookie Management</h3>
                    <p className="text-gray-300 mb-3">
                      You can manage cookie preferences through:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li><strong>Platform Settings:</strong> Modify cookie preferences from the settings menu in your dashboard</li>
                      <li><strong>Browser Settings:</strong> Most browsers offer tools to manage cookies</li>
                      <li><strong>Private Mode:</strong> Session cookies are deleted in your browser's private mode</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">5. Cookie Retention Periods</h3>
                    <p className="text-gray-300 mb-3">
                      Different retention periods apply to different cookie types:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li><strong>Session Cookies:</strong> Deleted when browser closes</li>
                      <li><strong>Persistent Cookies:</strong> 1 year</li>
                      <li><strong>Analytics Cookies:</strong> 2 years</li>
                      <li><strong>Preference Cookies:</strong> 1 year</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">6. Rejecting Cookies</h3>
                    <p className="text-gray-300">
                      You can choose to reject cookies entirely, but some platform features may not work properly. 
                      Essential cookies cannot be disabled as they're required for platform functionality.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">7. Updates</h3>
                    <p className="text-gray-300">
                      This cookie policy may be updated from time to time. Notifications will be provided via 
                      the platform when significant changes occur.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">8. Contact</h3>
                    <p className="text-gray-300">
                      For questions about our cookie policy:{' '}
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
