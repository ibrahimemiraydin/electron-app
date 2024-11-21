import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>(''); // Kullanıcının girdiği URL
  const [error, setError] = useState<string | null>(null); // Hata mesajı için state
  const [savedUrls, setSavedUrls] = useState<string[]>([]); // Kaydedilen URL'ler
  const [editIndex, setEditIndex] = useState<number | null>(null); // Düzenleme yapılan URL'nin index'i
  const [editUrl, setEditUrl] = useState<string>(''); // Düzenlenen URL
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal durumu

  // useEffect ile Electron'dan gelen hata mesajlarını dinle
  useEffect(() => {
    window.api.onLoadError(({ errorCode, errorDescription, url }) => {
      // URL yüklenemediğinde hata mesajını set et
      setError(`URL yüklenemedi (${url}): ${errorDescription} (Hata Kodu: ${errorCode})`);
    });
  }, []);

  // Form submit fonksiyonu
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (url) {
      let formattedUrl = url;

      // URL geçersizse Google'da arama yap
      if (!/^https?:\/\//i.test(url) && !/\.[a-z]{2,}$/i.test(url)) {
        formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      } else if (!/^https?:\/\//i.test(url)) {
        formattedUrl = 'http://' + url; // Eğer URL'de http/https yoksa http:// ekle
      }

      // Hata durumunu temizle ve URL'yi Electron'a ilet
      setError(null);
      window.api.openUrl(formattedUrl);
    } else {
      // Eğer URL boşsa hata mesajı göster
      setError('Lütfen geçerli bir URL girin!');
    }
  };

  // URL kaydetme fonksiyonu
  const handleSave = () => {
    if (url && !savedUrls.includes(url)) {
      setSavedUrls([...savedUrls, url]);
      setUrl('');
    }
  };

  // Kaydedilen URL'ye tıklandığında yeni pencerede açma
  const handleUrlClick = (savedUrl: string) => {
    let formattedUrl = savedUrl;

     // URL geçersizse Google'da arama yap
   if (!/^https?:\/\//i.test(savedUrl) && !/\.[a-z]{2,}$/i.test(savedUrl)) {
    formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(savedUrl)}`;
    } else if (!/^https?:\/\//i.test(savedUrl)) {
      // Eğer URL'de http/https yoksa, http:// ekle
      formattedUrl = 'http://' + savedUrl;
  }

    // URL'yi Electron'a gönder ve yeni pencere aç
    window.api.openUrl(formattedUrl);
  };

  // URL düzenleme fonksiyonu (modalda düzenleme yapılacak)
  const handleEdit = (index: number, savedUrl: string) => {
    setEditIndex(index);
    setEditUrl(savedUrl);
  };

  // URL düzenleme kaydetme fonksiyonu
  const handleSaveEdit = () => {
    if (editUrl) {
      setSavedUrls(savedUrls.map((url, index) => (index === editIndex ? editUrl : url)));
      setEditIndex(null);
      setEditUrl('');
    }
  };

  // URL silme fonksiyonu
  const handleDelete = (savedUrl: string) => {
    setSavedUrls(savedUrls.filter((url) => url !== savedUrl));
  };

  // Modal açma kapama
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // URL'yi kesmek için yardımcı fonksiyon
  const truncateUrl = (url: string, maxLength: number) => {
    if (url.length > maxLength) {
      return `${url.substring(0, maxLength)}...`;
    }
    return url;
  };

  // Modal dışında tıklama kontrolü
  const handleModalOutsideClick = (e: React.MouseEvent) => {
    // Modal dışına tıklandığında kapatılmasını sağlamak
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // Modalı kapatma sırasında URL kaydetme
  const handleCloseModal = () => {
    // Düzenleme yapılıyorsa kaydet
    if (editUrl && editIndex !== null) {
      setSavedUrls(savedUrls.map((url, index) => (index === editIndex ? editUrl : url)));
    }
    // Modalı kapat ve düzenleme moduna geri dön
    setIsModalOpen(false);
    setEditIndex(null); // Düzenleme index'ini sıfırla
    setEditUrl(''); // Düzenleme URL'ini temizle
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">URL Açıcı</h1>
      <form onSubmit={handleSubmit} className="w-full sm:w-96  bg-white p-6 rounded-lg shadow-lg">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL veya anahtar kelime girin"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="w-full sm:w-1/2 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Aç
          </button>
          {url && !editIndex && (
            <button
              type="button"
              onClick={handleSave}
              className="ml-2 w-full sm:w-1/2 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Kaydet
            </button>
          )}
        </div>
      </form>
      {error && (
        <p className="text-red-500 font-semibold mt-4">
          {error}
        </p>
      )}

      {/* Kaydedilenler Butonu */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={toggleModal}
          className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
        >
          Kaydedilenler
        </button>
      </div>

      {/* Kaydedilen URL'leri gösteren Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
          onClick={handleModalOutsideClick}
        >
          <div className="bg-white p-8 rounded-lg w-2/3 h-3/4 shadow-lg relative overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">Kaydedilen URL'ler</h2>
            <ul className="space-y-2">
              {savedUrls.map((savedUrl, index) => (
                <li key={index} className="flex items-center justify-between">
                  {editIndex === index ? (
                    <div className="flex items-center space-x-2 w-full">
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="w-3/4 p-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Kaydet
                      </button>
                    </div>
                  ) : (
                    <span
                      className="text-blue-600 cursor-pointer hover:underline"
                      onClick={() => handleUrlClick(savedUrl)}
                    >
                      {/* URL'yi kısalt */}
                      {truncateUrl(savedUrl, 40)}
                    </span>
                  )}
                  <div className="space-x-2">
                    {/* Düzenle ve Sil butonları sadece düzenleme modundaki URL için */}
                    {editIndex !== index && (
                      <>
                        <button
                          onClick={() => handleEdit(index, savedUrl)}
                          className="border-2 border-yellow-500 text-yellow-500 px-4 py-2 rounded-lg hover:bg-yellow-100"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(savedUrl)}
                          className="border-2 border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-100"
                        >
                          Sil
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Modal Kapanış Butonu */}
            <div className="absolute top-2 right-2">
              <button
                onClick={handleCloseModal}
                className="text-xl font-bold text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
