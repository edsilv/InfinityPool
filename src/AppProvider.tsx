import { useRef } from "react";
import { AppContext, AppProps, AppStore, createAppStore } from "./Store";

type AppProviderProps = React.PropsWithChildren<AppProps>;

export function AppProvider({ children, ...props }: AppProviderProps) {
  console.log("AppProvider", props);
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = createAppStore(props);
  }
  return (
    <AppContext.Provider value={storeRef.current}>
      {children}
    </AppContext.Provider>
  );
}
