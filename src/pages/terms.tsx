import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "wouter";

export default function Terms() {
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
          <h1 className="text-4xl font-bold mb-8">{t('footerTerms')}</h1>
          
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
                    <h3 className="text-lg font-semibold text-white mb-3">1. Hizmet Şartları</h3>
                    <p className="text-gray-300">
                      IQsion platformunu kullanarak bu kullanım şartlarını kabul etmiş olursunuz. 
                      Platformumuz, işletmelere pazarlama verilerini analiz etme ve optimize etme hizmeti sunmaktadır.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">2. Hesap Oluşturma ve Sorumluluklar</h3>
                    <p className="text-gray-300 mb-3">
                      IQsion'da hesap oluştururken:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>18 yaşından büyük olmalısınız</li>
                      <li>Doğru ve güncel bilgiler sağlamalısınız</li>
                      <li>Hesap güvenliğinden siz sorumlusunuz</li>
                      <li>Hesabınızı başkalarıyla paylaşmamalısınız</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">3. Kabul Edilebilir Kullanım</h3>
                    <p className="text-gray-300 mb-3">
                      Platformumuzu kullanırken şunları yapamazsınız:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>Yasadışı aktivitelerde bulunmak</li>
                      <li>Platformun güvenliğini tehlikeye atmak</li>
                      <li>Spam veya kötü amaçlı içerik göndermek</li>
                      <li>Başkalarının hesaplarına yetkisiz erişim sağlamak</li>
                      <li>Platform API'larını kötüye kullanmak</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">4. Fikri Mülkiyet</h3>
                    <p className="text-gray-300">
                      IQsion platformu, logosu, içeriği ve yazılımı IQsion'un fikri mülkiyetidir. 
                      Platform üzerinden oluşturduğunuz analizler ve raporlar size aittir, ancak bunları 
                      üretmek için kullandığımız teknoloji ve metodoloji IQsion'a aittir.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">5. Ödeme ve Abonelik</h3>
                    <p className="text-gray-300 mb-3">
                      Abonelik koşulları:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>Aylık veya yıllık ödeme seçenekleri mevcuttur</li>
                      <li>Ödemeler otomatik olarak yenilenir</li>
                      <li>14 günlük ücretsiz deneme süresi sunulmaktadır</li>
                      <li>İptal işlemi her zaman yapılabilir</li>
                      <li>İade politikası için müşteri hizmetlerine başvurun</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">6. Hizmet Değişiklikleri</h3>
                    <p className="text-gray-300">
                      IQsion, platformun özelliklerini, fiyatlandırmasını ve kullanım şartlarını önceden 
                      bildirimde bulunarak değiştirme hakkını saklı tutar. Önemli değişiklikler e-posta 
                      yoluyla bildirilecektir.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">7. Hizmet Garantisi ve Sorumluluk Sınırlaması</h3>
                    <p className="text-gray-300">
                      IQsion platformu "olduğu gibi" sunulmaktadır. Kesintisiz hizmet garantisi vermemekle birlikte, 
                      %99.9 uptime hedefine sahibiz. Platform üzerinden alınan kararlardan doğacak ticari kayıplardan 
                      IQsion sorumlu tutulamaz.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">8. Hesap Kapatma</h3>
                    <p className="text-gray-300">
                      Hesabınızı istediğiniz zaman kapatabilirsiniz. IQsion, şartları ihlal eden hesapları 
                      askıya alabilir veya kapatabilir. Hesap kapatıldığında, verileriniz 30 gün içinde 
                      silinecektir.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">9. İletişim</h3>
                    <p className="text-gray-300">
                      Kullanım şartlarımızla ilgili sorularınız için lütfen bizimle iletişime geçin:{' '}
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
                    <h3 className="text-lg font-semibold text-white mb-3">1. Terms of Service</h3>
                    <p className="text-gray-300">
                      By using the IQsion platform, you accept these terms of use. 
                      Our platform provides businesses with marketing data analysis and optimization services.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">2. Account Creation and Responsibilities</h3>
                    <p className="text-gray-300 mb-3">
                      When creating an account on IQsion:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>You must be at least 18 years old</li>
                      <li>You must provide accurate and current information</li>
                      <li>You are responsible for account security</li>
                      <li>You must not share your account with others</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">3. Acceptable Use</h3>
                    <p className="text-gray-300 mb-3">
                      While using our platform, you may not:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>Engage in illegal activities</li>
                      <li>Compromise platform security</li>
                      <li>Send spam or malicious content</li>
                      <li>Gain unauthorized access to others' accounts</li>
                      <li>Abuse platform APIs</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">4. Intellectual Property</h3>
                    <p className="text-gray-300">
                      The IQsion platform, logo, content, and software are the intellectual property of IQsion. 
                      Analyses and reports you create on the platform belong to you, but the technology and 
                      methodology used to produce them belong to IQsion.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">5. Payment and Subscription</h3>
                    <p className="text-gray-300 mb-3">
                      Subscription terms:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>Monthly or annual payment options available</li>
                      <li>Payments automatically renew</li>
                      <li>14-day free trial period offered</li>
                      <li>Cancellation can be done at any time</li>
                      <li>Contact customer service for refund policy</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">6. Service Changes</h3>
                    <p className="text-gray-300">
                      IQsion reserves the right to modify platform features, pricing, and terms of use with 
                      prior notice. Significant changes will be communicated via email.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">7. Service Warranty and Liability Limitation</h3>
                    <p className="text-gray-300">
                      The IQsion platform is provided "as is". While we don't guarantee uninterrupted service, 
                      we aim for 99.9% uptime. IQsion cannot be held liable for business losses resulting from 
                      decisions made using the platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">8. Account Closure</h3>
                    <p className="text-gray-300">
                      You can close your account at any time. IQsion may suspend or close accounts that violate the terms 
                      of service. When an account is closed, your data will be deleted within 30 days.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">9. Contact</h3>
                    <p className="text-gray-300">
                      For questions about our terms of service, please contact us at{' '}
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
