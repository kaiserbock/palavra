import {
  Youtube,
  BookMarked,
  ScrollText,
  Menu,
  User,
  LogOut,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import { useRouter } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut, useSession } from "next-auth/react";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

function MobileMenu() {
  const { data: session } = useSession();
  const { savedTerms } = useSavedTerms();
  const savedTermsCount = savedTerms.length;
  const router = useRouter();

  if (!session) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>
        <div className="flex flex-col">
          {/* User Profile Section */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <div className="bg-muted p-2 rounded-full">
              <User className="h-6 w-6" />
            </div>
            <span className="font-medium">{session.user?.name}</span>
          </div>

          {/* Navigation Section */}
          <div className="py-6 flex flex-col gap-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 px-4"
              onClick={() => router.push("/transcriptions")}
            >
              <Youtube className="h-5 w-5" />
              <span>Transcriptions</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 px-4 relative"
              onClick={() => router.push("/terms")}
            >
              <BookMarked className="h-5 w-5" />
              <span>Terms</span>
              {savedTermsCount > 0 && (
                <span className="absolute right-4 bg-primary text-xs text-primary-foreground w-5 h-5 flex items-center justify-center rounded-full">
                  {savedTermsCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 px-4"
              onClick={() => router.push("/flashcards")}
            >
              <ScrollText className="h-5 w-5" />
              <span>Flashcards</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 px-4"
              onClick={() => router.push("/texts")}
            >
              <BookOpen className="h-5 w-5" />
              <span>Custom Texts</span>
            </Button>
          </div>

          {/* Footer Section */}
          <div className="mt-auto border-t pt-6">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 px-4 text-red-500 hover:text-red-500 hover:bg-red-50"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DesktopNav() {
  const { savedTerms } = useSavedTerms();
  const savedTermsCount = savedTerms.length;
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) return <AuthButton />;

  return (
    <nav className="hidden sm:flex items-center gap-2">
      <div className="flex items-center gap-2 border-r pr-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => router.push("/transcriptions")}
        >
          <Youtube className="h-4 w-4" />
          <span>Transcriptions</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 relative"
          onClick={() => router.push("/terms")}
        >
          <BookMarked className="h-4 w-4" />
          <span>Terms</span>
          {savedTermsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-[10px] text-primary-foreground w-4 h-4 flex items-center justify-center rounded-full">
              {savedTermsCount}
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => router.push("/flashcards")}
        >
          <ScrollText className="h-4 w-4" />
          <span>Flashcards</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => router.push("/texts")}
        >
          <BookOpen className="h-4 w-4" />
          <span>Custom Texts</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <User className="h-4 w-4" />
          <span className="text-sm">{session.user?.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </nav>
  );
}

export function Header() {
  const router = useRouter();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            className="flex items-center gap-1.5 sm:gap-2 p-0 h-auto"
            onClick={() => router.push("/")}
          >
            <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
            <div className="hidden sm:flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                YouTube Transcript
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground -mt-1">
                Fetch and enhance transcripts
              </p>
            </div>
          </Button>
        </div>
        <div className="flex items-center">
          <DesktopNav />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
