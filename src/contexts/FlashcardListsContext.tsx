"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useSavedTerms } from "./SavedTermsContext";

interface FlashcardList {
  id: string;
  name: string;
  termIds: string[];
}

interface FlashcardListsContextType {
  lists: FlashcardList[];
  currentListId: string | null;
  createList: (name: string) => void;
  deleteList: (id: string) => void;
  addTermToList: (listId: string, termId: string) => void;
  removeTermFromList: (listId: string, termId: string) => void;
  setCurrentList: (id: string | null) => void;
}

const FlashcardListsContext = createContext<
  FlashcardListsContextType | undefined
>(undefined);

export function FlashcardListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<FlashcardList[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("flashcardLists");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [currentListId, setCurrentListId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentFlashcardListId");
    }
    return null;
  });

  const saveLists = (newLists: FlashcardList[]) => {
    setLists(newLists);
    localStorage.setItem("flashcardLists", JSON.stringify(newLists));
  };

  const createList = (name: string) => {
    const newList: FlashcardList = {
      id: Date.now().toString(),
      name,
      termIds: [],
    };
    saveLists([...lists, newList]);
  };

  const deleteList = (id: string) => {
    const newLists = lists.filter((list) => list.id !== id);
    saveLists(newLists);
    if (currentListId === id) {
      setCurrentListId(null);
      localStorage.removeItem("currentFlashcardListId");
    }
  };

  const addTermToList = (listId: string, termId: string) => {
    const newLists = lists.map((list) =>
      list.id === listId
        ? { ...list, termIds: [...list.termIds, termId] }
        : list
    );
    saveLists(newLists);
  };

  const removeTermFromList = (listId: string, termId: string) => {
    const newLists = lists.map((list) =>
      list.id === listId
        ? { ...list, termIds: list.termIds.filter((id) => id !== termId) }
        : list
    );
    saveLists(newLists);
  };

  const setCurrentList = (id: string | null) => {
    setCurrentListId(id);
    if (id) {
      localStorage.setItem("currentFlashcardListId", id);
    } else {
      localStorage.removeItem("currentFlashcardListId");
    }
  };

  return (
    <FlashcardListsContext.Provider
      value={{
        lists,
        currentListId,
        createList,
        deleteList,
        addTermToList,
        removeTermFromList,
        setCurrentList,
      }}
    >
      {children}
    </FlashcardListsContext.Provider>
  );
}

export function useFlashcardLists() {
  const context = useContext(FlashcardListsContext);
  if (context === undefined) {
    throw new Error(
      "useFlashcardLists must be used within a FlashcardListsProvider"
    );
  }
  return context;
}
