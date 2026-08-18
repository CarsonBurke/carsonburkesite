import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  const rendered = useMemo(
    () =>
      toast && (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-3"
        >
          <div
            className="animate-toast-in flex items-center gap-3 rounded-full px-4 py-2 text-[0.95rem] font-bold shadow-lg"
            style={{
              backgroundColor: "var(--popover-bg-color)",
              boxShadow: "0 0 0 1px var(--shade-color), 0 4px 16px rgb(0 0 6 / 25%)",
            }}
          >
            {toast.message}
          </div>
        </div>
      ),
    [toast],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {rendered}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast used outside ToastProvider");
  return show;
}
