import { UrlInput } from './url-input';

export default function Home() {
  return (
    <main className="relative flex h-screen items-center justify-center bg-linear-to-br from-amber-50 to-orange-50 px-4 opacity-100 transition-opacity duration-300 dark:from-slate-900 dark:to-slate-950 starting:opacity-0">
      <div className="relative flex w-full flex-col items-center">
        <div className="absolute bottom-full mb-12 flex flex-col items-center gap-2">
          <h1 className="translate-y-0 scale-100 bg-linear-to-r from-rose-500 to-teal-500 bg-clip-text text-center text-6xl font-extrabold text-transparent transition-all dark:from-rose-400 dark:to-teal-400">
            Notix
          </h1>
          <div className="flex gap-2 text-2xl">
            <span
              className="animate-bounce-with-pause"
              style={{ animationDelay: '0ms' }}
            >
              📝
            </span>
            <span
              className="animate-bounce-with-pause"
              style={{ animationDelay: '150ms' }}
            >
              ✨
            </span>
            <span
              className="animate-bounce-with-pause"
              style={{ animationDelay: '300ms' }}
            >
              🎓
            </span>
          </div>
        </div>
        <UrlInput />
      </div>
    </main>
  );
}
