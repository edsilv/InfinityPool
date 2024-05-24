import { AppContext, AppState } from "@/Store";
import { useContext } from "react";
import { useStore } from "zustand";

export function useAppContext<T>(selector: (state: AppState) => T): T {
  const store = useContext(AppContext)!;
  // if (!store) {
  //  console.log("Missing AppContext.Provider in the tree");
  //  return null;
  // }
  return useStore(store, selector);
}
