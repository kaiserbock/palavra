import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserDetails {
  _id: string;
  name: string;
  email: string;
  nativeLanguage: string;
  learningLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export function useUser() {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [session]);

  return { user, isLoading, error };
}
