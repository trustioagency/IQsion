import React from 'react';

const Settings: React.FC<{ language: 'tr' | 'en' }> = ({ language }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Ayarlar</h1>
      <p>Kullanıcı ayarları burada görünecek.</p>
    </div>
  );
};

export default Settings;
