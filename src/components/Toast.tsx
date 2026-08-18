import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** AdwToast: one pill at the bottom of the window, dismissed on a timeout. */
const ToastContext = createContext<((message: string) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((message: string) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message });
    timer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* The live region stays mounted: screen readers ignore one that appears
          already holding its text. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-3"
      >
        {toast && (
          <div
            key={toast.id}
            className="animate-toast-in flex items-center gap-3 rounded-full px-4 py-2 text-[0.95rem] font-bold"
            style={{
              backgroundColor: "var(--popover-bg-color)",
              boxShadow: "0 0 0 1px var(--shade-color), 0 4px 16px rgb(0 0 6 / 25%)",
            }}
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast used outside ToastProvider");
  return show;
}
