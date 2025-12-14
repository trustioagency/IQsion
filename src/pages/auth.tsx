
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type InputChangeEvent = {
  target: {
    name: string;
    value: string;
  };
};

type FormSubmitEvent = {
  preventDefault: () => void;
};

export default function Auth() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: ''
  });

  const handleInputChange = (e: InputChangeEvent) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const persistUserUid = (uid: string | undefined) => {
    if (!uid) return;
    try {
      window.localStorage.setItem('userUid', uid);
    } catch (error) {
      console.warn('Kullanıcı oturumu localStorage\'a kaydedilemedi.', error);
    }
  };

  const handleLogin = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        })
      });
      const result = await response.json().catch(() => undefined);
      if (!response.ok) {
        throw new Error(result?.message || 'Giriş başarısız.');
      }
      persistUserUid(result?.uid ?? 'demo-uid-123');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      alert((error instanceof Error ? error.message : 'Giriş başarısız.') + '\nDemo hesabıyla devam ediliyor.');
      persistUserUid('demo-uid-123');
      window.location.href = '/dashboard';
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
        })
      });
      const result = await response.json().catch(() => undefined);
      if (!response.ok) {
        throw new Error(result?.message || 'Kayıt başarısız.');
      }
      persistUserUid(result?.uid ?? 'demo-uid-123');
      window.location.href = '/onboarding';
    } catch (error) {
      console.error('Signup error:', error);
      alert((error instanceof Error ? error.message : 'Kayıt başarısız.') + '\nDemo hesabıyla devam ediliyor.');
      persistUserUid('demo-uid-123');
      window.location.href = '/onboarding';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-blue-900/20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/iqsion.logo.png" 
              alt="IQsion" 
              className="w-16 h-16 object-contain mix-blend-lighten drop-shadow-2xl"
            />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              IQsion
            </h1>
          </div>
          <p className="text-gray-400 text-sm">AI-Powered Marketing Intelligence Platform</p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl shadow-2xl shadow-blue-900/20">
          <CardHeader className="border-b border-gray-800/50">
            <CardTitle className="text-center text-white text-lg">Hesabınıza Erişin</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 p-1">
                <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-800 data-[state=active]:to-blue-950 data-[state=active]:text-white text-gray-400 data-[state=active]:shadow-lg">Giriş Yap</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-800 data-[state=active]:to-blue-950 data-[state=active]:text-white text-gray-400 data-[state=active]:shadow-lg">Hesap Oluştur</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">E-posta</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ornek@sirket.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Şifre</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white font-semibold shadow-xl shadow-blue-900/40 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Giriş yapılıyor...
                      </>
                    ) : (
                      'Giriş Yap'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-300">Ad</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Adınız"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-300">Soyad</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Soyadınız"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-gray-300">Şirket Adı</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="Şirket Adı"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-gray-300">E-posta</Label>
                    <Input
                      id="signupEmail"
                      name="email"
                      type="email"
                      placeholder="ornek@sirket.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-gray-300">Şifre</Label>
                    <Input
                      id="signupPassword"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">Şifre Tekrar</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white font-semibold shadow-xl shadow-blue-900/40 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Hesap oluşturuluyor...
                      </>
                    ) : (
                      'Hesap Oluştur'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            © 2024 IQsion. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
