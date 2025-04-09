"use client";

import { useState, useRef } from "react";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import { useFlashcardLists } from "@/contexts/FlashcardListsContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shuffle,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";
import { FlashcardLists } from "@/components/flashcards/FlashcardLists";

export default function FlashcardsPage() {
  const { savedTerms } = useSavedTerms();
  const { currentListId, lists } = useFlashcardLists();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const cardRef = useRef<HTMLDivElement>(null);

  // Get terms for current list
  const currentList = lists.find((list) => list.id === currentListId);
  const listTerms = currentList
    ? savedTerms.filter((term) => currentList.termIds.includes(term.id))
    : savedTerms;

  // Filter out terms without translations
  const validTerms = listTerms.filter((term) => term.translation);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);

    if (touchStart && cardRef.current) {
      const distance = currentTouch - touchStart;
      const direction = distance > 0 ? "right" : "left";
      setSwipeDirection(direction);

      // Apply transform to card for visual feedback
      cardRef.current.style.transform = `translateX(${distance * 0.5}px)`;
      cardRef.current.style.transition = "none";
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    // Reset card position with transition
    if (cardRef.current) {
      cardRef.current.style.transform = "translateX(0)";
      cardRef.current.style.transition = "transform 0.3s ease-out";
    }

    const distance = touchEnd - touchStart;
    const isLeftSwipe = distance < -minSwipeDistance;
    const isRightSwipe = distance > minSwipeDistance;

    if (isLeftSwipe && currentIndex < validTerms.length - 1) {
      nextCard();
    }
    if (isRightSwipe && currentIndex > 0) {
      previousCard();
    }

    setTouchStart(null);
    setTouchEnd(null);
    setSwipeDirection(null);
  };

  const shuffleTerms = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsPeeking(false);
  };

  const nextCard = () => {
    if (currentIndex < validTerms.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setIsPeeking(false);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setIsPeeking(false);
    }
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsPeeking(false);
  };

  if (!validTerms.length) {
    return (
      <div className="h-screen flex flex-col overflow-hidden touch-none">
        <Header />
        <div className="flex-1 container max-w-2xl mx-auto px-4 py-8 overflow-hidden touch-none">
          <div className="space-y-8 h-full overflow-hidden touch-none">
            <FlashcardLists />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-lg text-muted-foreground">
                  {currentList
                    ? "No flashcards in this list. Add some terms first!"
                    : "No flashcards available. Add some terms with translations first!"}
                </p>
                <Button variant="outline" onClick={resetCards}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentTerm = validTerms[currentIndex];
  const showTranslation = isFlipped || isPeeking;

  return (
    <div className="h-screen flex flex-col overflow-hidden touch-none">
      <Header />
      <div className="flex-1 container max-w-2xl mx-auto px-4 py-8 overflow-hidden touch-none">
        <div className="space-y-8 h-full overflow-hidden touch-none">
          <FlashcardLists />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {validTerms.length}
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={shuffleTerms}>
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle
              </Button>
              <Button variant="outline" size="sm" onClick={resetCards}>
                <RotateCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <div className="space-y-4 relative overflow-hidden touch-none">
            <Card
              ref={cardRef}
              className={cn(
                "aspect-[3/2] flex flex-col p-8 select-none touch-none relative z-10 bg-background will-change-transform",
                swipeDirection === "left" && "cursor-w-resize",
                swipeDirection === "right" && "cursor-e-resize"
              )}
              onTouchStart={(e) => {
                e.stopPropagation();
                onTouchStart(e);
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
                onTouchMove(e);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                onTouchEnd();
              }}
            >
              <div className="flex-1 flex items-center justify-center">
                <div className="space-y-4 text-center">
                  {currentTerm.category && (
                    <div className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary/70 inline-block">
                      {currentTerm.category}
                    </div>
                  )}
                  <div className="text-2xl font-medium">
                    {showTranslation
                      ? currentTerm.translation
                      : currentTerm.text}
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onMouseDown={() => setIsPeeking(true)}
                  onMouseUp={() => setIsPeeking(false)}
                  onMouseLeave={() => setIsPeeking(false)}
                  onTouchStart={() => setIsPeeking(true)}
                  onTouchEnd={() => setIsPeeking(false)}
                >
                  {isPeeking ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">
                        Release to hide translation
                      </span>
                      <span className="sm:hidden">Release to hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">
                        Hold to see translation
                      </span>
                      <span className="sm:hidden">Hold to see</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={previousCard}
              disabled={currentIndex === 0}
              className="hidden sm:flex"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={nextCard}
              disabled={currentIndex === validTerms.length - 1}
              className="hidden sm:flex"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="sm:hidden text-center text-sm text-muted-foreground">
            Swipe left or right to navigate cards
          </div>
        </div>
      </div>
    </div>
  );
}
