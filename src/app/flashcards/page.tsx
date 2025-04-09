"use client";

import { useState, useEffect } from "react";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import { useFlashcardLists } from "@/contexts/FlashcardListsContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Shuffle,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Plus,
  PlusCircle,
  X,
} from "lucide-react";
import { FlashcardGroupCard } from "@/components/flashcards/FlashcardGroupCard";
import { AddTermsToGroup } from "@/components/flashcards/AddTermsToGroup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function FlashcardsPage() {
  const { savedTerms } = useSavedTerms();
  const { lists, createList, deleteList, currentListId, setCurrentList } =
    useFlashcardLists();
  const [newListName, setNewListName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isAddTermsOpen, setIsAddTermsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList(newListName.trim());
      setNewListName("");
      setIsDialogOpen(false);
    }
  };

  // Get terms for current list
  const currentList = lists.find((list) => list._id === currentListId);
  const listTerms = currentList
    ? savedTerms.filter((term) =>
        currentList.termIds.includes(`${term.text}-${term.language}`)
      )
    : savedTerms;

  // Filter out terms without translations
  const validTerms = listTerms.filter((term) => term.translation);

  const shuffleTerms = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (currentIndex < validTerms.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleGroupClick = (listId: string) => {
    setCurrentList(listId);
    setIsSliderOpen(true);
    resetCards();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-screen flex">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h2 className="text-lg font-semibold">Flashcard Groups</h2>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4 mr-2" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Group name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateList();
                      }
                    }}
                  />
                  <Button onClick={handleCreateList} className="w-full">
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {lists.map((list) => (
                <FlashcardGroupCard
                  key={list._id}
                  listId={list._id}
                  onGroupClick={handleGroupClick}
                  onRemove={() => deleteList(list._id)}
                />
              ))}
              {lists.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No groups created yet. Create your first group to get started!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Slider */}
      <div
        className={cn(
          "fixed inset-0 bg-background transition-transform duration-300 ease-in-out z-50",
          isSliderOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSliderOpen(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {currentList ? currentList.name : "Flashcards"}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSliderOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl mx-auto space-y-8">
              {validTerms.length === 0 ? (
                <div className="text-center space-y-4">
                  <p className="text-lg text-muted-foreground">
                    No flashcards in this group. Add some terms first!
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddTermsOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Terms
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Card {currentIndex + 1} of {validTerms.length}
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsAddTermsOpen(true)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={shuffleTerms}
                      >
                        <Shuffle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={resetCards}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Card
                    className="aspect-[3/2] flex flex-col p-8 select-none cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <div className="space-y-4 text-center">
                        {validTerms[currentIndex].category && (
                          <div className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary/70 inline-block">
                            {validTerms[currentIndex].category}
                          </div>
                        )}
                        <div
                          className={cn(
                            "text-2xl font-medium",
                            isFlipped && "text-muted-foreground"
                          )}
                        >
                          {isFlipped
                            ? validTerms[currentIndex].translation
                            : validTerms[currentIndex].text}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={previousCard}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextCard}
                      disabled={currentIndex === validTerms.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Terms Sheet */}
      <Sheet open={isAddTermsOpen} onOpenChange={setIsAddTermsOpen}>
        <SheetContent className="h-full">
          <SheetHeader className="mb-4">
            <SheetTitle>Add Terms to Group</SheetTitle>
          </SheetHeader>
          {currentListId && <AddTermsToGroup listId={currentListId} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
