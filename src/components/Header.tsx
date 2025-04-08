import { Languages, Youtube, BookMarked, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";

interface HeaderProps {
  onOpenTerms?: () => void;
}

export function Header({ onOpenTerms }: HeaderProps) {
  const { savedTerms } = useSavedTerms();
  const savedTermsCount = savedTerms.length;
  const pathname = usePathname();
  const isFlashcardsPage = pathname === "/flashcards";

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
            <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                YouTube Transcript
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground -mt-1">
                Fetch and enhance transcripts
              </p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
            <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Multi-language support</span>
          </div>
          {savedTermsCount > 0 && !isFlashcardsPage && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden relative h-12 w-12"
                onClick={onOpenTerms}
              >
                <BookMarked className="!h-7 !w-7" />
                <span className="absolute top-0.5 right-0.5 bg-primary p-2.5 text-[10px] text-primary-foreground w-4 h-4 flex items-center justify-center rounded-full">
                  {savedTermsCount}
                </span>
              </Button>
              <Link href="/flashcards">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center gap-2"
                >
                  <ScrollText className="h-4 w-4" />
                  Flashcards
                </Button>
              </Link>
            </>
          )}
          {isFlashcardsPage && (
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Transcript
              </Button>
            </Link>
          )}
          <div className="ml-4 border-l pl-4">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
