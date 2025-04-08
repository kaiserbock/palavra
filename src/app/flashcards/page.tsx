"use client";

import { useState } from "react";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
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

export default function FlashcardsPage() {
  const { savedTerms } = useSavedTerms();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [shuffledTerms, setShuffledTerms] = useState(() => [...savedTerms]);

  // Filter out terms without translations
  const validTerms = shuffledTerms.filter((term) => term.translation);

  const shuffleTerms = () => {
    setShuffledTerms([...validTerms].sort(() => Math.random() - 0.5));
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
    setShuffledTerms([...savedTerms]);
  };

  if (!validTerms.length) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              No flashcards available. Add some terms with translations first!
            </p>
            <Button variant="outline" onClick={resetCards}>
              <RotateCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentTerm = validTerms[currentIndex];
  const showTranslation = isFlipped || isPeeking;

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 container max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-8">
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

          <div className="space-y-4">
            <Card className="aspect-[3/2] flex flex-col p-8 select-none">
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
                >
                  {isPeeking ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Release to hide translation
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Hold to see translation
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
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={nextCard}
              disabled={currentIndex === validTerms.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
