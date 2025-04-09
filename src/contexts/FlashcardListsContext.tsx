"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface FlashcardList {
  _id: string;
  name: string;
  termIds: string[];
}

interface FlashcardListsContextType {
  lists: FlashcardList[];
  currentListId: string | null;
  createList: (name: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addTermToList: (listId: string, termId: string) => Promise<void>;
  removeTermFromList: (listId: string, termId: string) => Promise<void>;
  setCurrentList: (id: string | null) => void;
  isLoading: boolean;
}

const FlashcardListsContext = createContext<
  FlashcardListsContextType | undefined
>(undefined);

export function FlashcardListsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [lists, setLists] = useState<FlashcardList[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchLists();
    }
  }, [session?.user?.id]);

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/flashcard-lists");
      if (!response.ok) {
        throw new Error("Failed to fetch flashcard lists");
      }
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error("Error fetching flashcard lists:", error);
      toast.error("Failed to load flashcard lists");
    } finally {
      setIsLoading(false);
    }
  };

  const createList = async (name: string) => {
    try {
      const response = await fetch("/api/flashcard-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to create flashcard list");
      }

      const newList = await response.json();
      setLists((prevLists) => [...prevLists, newList]);
      toast.success("Flashcard list created successfully");
    } catch (error) {
      console.error("Error creating flashcard list:", error);
      toast.error("Failed to create flashcard list");
    }
  };

  const deleteList = async (id: string) => {
    try {
      const response = await fetch(`/api/flashcard-lists?listId=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard list");
      }

      setLists((prevLists) => prevLists.filter((list) => list._id !== id));
      if (currentListId === id) {
        setCurrentListId(null);
      }
      toast.success("Flashcard list deleted successfully");
    } catch (error) {
      console.error("Error deleting flashcard list:", error);
      toast.error("Failed to delete flashcard list");
    }
  };

  const addTermToList = async (listId: string, termId: string) => {
    try {
      const response = await fetch("/api/flashcard-lists/terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listId, termId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add term to flashcard list");
      }

      const updatedList = await response.json();
      setLists((prevLists) =>
        prevLists.map((list) => (list._id === listId ? updatedList : list))
      );
    } catch (error) {
      console.error("Error adding term to flashcard list:", error);
      toast.error("Failed to add term to flashcard list");
    }
  };

  const removeTermFromList = async (listId: string, termId: string) => {
    try {
      const response = await fetch(
        `/api/flashcard-lists/terms?listId=${listId}&termId=${termId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove term from flashcard list");
      }

      const updatedList = await response.json();
      setLists((prevLists) =>
        prevLists.map((list) => (list._id === listId ? updatedList : list))
      );
    } catch (error) {
      console.error("Error removing term from flashcard list:", error);
      toast.error("Failed to remove term from flashcard list");
    }
  };

  const setCurrentList = (id: string | null) => {
    setCurrentListId(id);
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
        isLoading,
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
