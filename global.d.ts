// global.d.ts
export {};

declare global {
  interface Window {
    electron: typeof electronAPI;
    api: {
      openUrl: (url: string) => void;
      onLoadError: (callback: (error: { errorCode: string; errorDescription: string; url: string }) => void) => void;
    };
  }
}
