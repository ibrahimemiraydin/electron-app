import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openUrl: (url: string) => void;
      onLoadError: (callback: (error: { errorCode: string; errorDescription: string; url: string }) => void) => void;
    }
  }
}
