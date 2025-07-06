
interface ImportMetaEnv {
  readonly VITE_MAIN_API: string;
  // add more VITE_ variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
