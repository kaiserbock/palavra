"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ICustomText } from "@/models/CustomText";
import { useUser } from "@/hooks/useUser";

interface CustomTextsContextType {
  customTexts: ICustomText[];
  addCustomText: (
    text: Omit<ICustomText, "_id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateCustomText: (id: string, text: Partial<ICustomText>) => Promise<void>;
  deleteCustomText: (id: string) => Promise<void>;
  isLoading: boolean;
}

const CustomTextsContext = createContext<CustomTextsContextType | undefined>(
  undefined
);

export function CustomTextsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customTexts, setCustomTexts] = useState<ICustomText[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchCustomTexts();
    }
  }, [user]);

  const fetchCustomTexts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/custom-texts`);
      if (!response.ok) throw new Error("Failed to fetch custom texts");
      const data = await response.json();
      setCustomTexts(data);
    } catch (err) {
      console.error("Error fetching custom texts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomText = async (
    text: Omit<ICustomText, "_id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    const response = await fetch("/api/custom-texts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(text),
    });
    if (!response.ok) throw new Error("Failed to add custom text");
    const newText = await response.json();
    setCustomTexts((prev) => [...prev, newText]);
  };

  const updateCustomText = async (id: string, text: Partial<ICustomText>) => {
    const response = await fetch(`/api/custom-texts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(text),
    });
    if (!response.ok) throw new Error("Failed to update custom text");
    const updatedText = await response.json();
    setCustomTexts((prev) => prev.map((t) => (t._id === id ? updatedText : t)));
  };

  const deleteCustomText = async (id: string) => {
    const response = await fetch(`/api/custom-texts/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete custom text");
    setCustomTexts((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <CustomTextsContext.Provider
      value={{
        customTexts,
        addCustomText,
        updateCustomText,
        deleteCustomText,
        isLoading,
      }}
    >
      {children}
    </CustomTextsContext.Provider>
  );
}

export function useCustomTexts() {
  const context = useContext(CustomTextsContext);
  if (context === undefined) {
    throw new Error("useCustomTexts must be used within a CustomTextsProvider");
  }
  return context;
}
