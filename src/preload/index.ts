import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  /**
   * URL'yi Electron ana işlemine iletir ve bir pencere açılmasını sağlar.
   * @param url - Kullanıcının girdiği URL.
   */
  openUrl: (url: string) => ipcRenderer.invoke('open-url', url),

  /**
   * Yükleme hatalarını dinler ve bir callback fonksiyonuyla hata mesajlarını iletir.
   * @param callback - Hata mesajını işlemek için çağrılacak fonksiyon.
   */
  onLoadError: (callback: (error: { errorCode: string; errorDescription: string; url: string }) => void) => {
    ipcRenderer.on('load-error', (_, error) => callback(error));
  },
  
};



// Electron'un context isolation özelliği etkinse, güvenli bir şekilde ana işlemleri expose ediyoruz.
if (process.contextIsolated) {
  try {
    // Electron'un kendi API'lerini ve özel API'leri ön yüke ekliyoruz.
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api); // 'api' burada kullanılabilir hale getiriliyor
  } catch (error) {
    console.error('Context Bridge hatası:', error);
  }
} else {
  // Eğer context isolation devre dışıysa, API'ler global alanda kullanılabilir.
  // @ts-ignore: Tip denetiminde hata vermemesi için
  window.electron = electronAPI;
  // @ts-ignore: Tip denetiminde hata vermemesi için
  window.api = api;
}
