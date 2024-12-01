import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  
  interface Window {
    electron: ElectronAPI
    api: {
      openUrl: (url: string) => void;
      onLoadError: (callback: (error: { errorCode: string; errorDescription: string; url: string }) => void) => void;
      getSavedUrls: () => string[];
      saveSavedUrls: (urls: string[]) => void;
    }
  }

  // Add the quitting property to the App interface
  interface App {
    quitting?: boolean;
  }
}
