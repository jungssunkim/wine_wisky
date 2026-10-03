import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";

type Guard = { register: (key: object, dirty: boolean) => void; leave: (action: () => void) => void };
const Context = createContext<Guard>({ register: () => {}, leave: action => action() });
export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const drafts = useRef(new Set<object>());
  const register = useCallback((key: object, dirty: boolean) => {
    if (dirty) drafts.current.add(key); else drafts.current.delete(key);
  }, []);
  const leave = useCallback((action: () => void) => {
    if (!drafts.current.size || window.confirm("저장하지 않은 내용이 있어요. 변경사항을 버리고 이동할까요?")) action();
  }, []);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (drafts.current.size) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);
  return <Context.Provider value={{ register, leave }}>{children}</Context.Provider>;
}
export function useUnsavedChanges(dirty: boolean) {
  const { register } = useContext(Context);
  const key = useRef({});
  useEffect(() => {
    const identity = key.current;
    register(identity, dirty);
    return () => register(identity, false);
  }, [dirty, register]);
}
export function useConfirmLeave() { return useContext(Context).leave; }
