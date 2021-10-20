import React, { useContext, ReactNode, useMemo, createContext } from "react";
import useSWR from "swr";

interface List {
  id: string;
  name: string;
}

interface Members {
  [key: string]: boolean;
}

interface ListsReturn {
  lists: List[];
  favorites: Members;
}

const ListsContext = createContext({});

export function ListsProvider({ children }: { children: ReactNode }) {
  const { data: lists = [] } = useSWR<List[]>("/api/twitter/lists");
  const favorite = lists.find(({ name }) => name === "favorites");
  const { data: favorites = {} } = useSWR<Members>(
    favorite ? `/api/twitter/lists/${favorite.id}/` : null
  );
  const context: ListsReturn = useMemo(
    () => ({
      lists,
      favorites,
    }),
    [lists, favorites]
  );
  return (
    <ListsContext.Provider value={context}>{children}</ListsContext.Provider>
  );
}

export function useLists(): ListsReturn {
  return useContext(ListsContext) as ListsReturn;
}
