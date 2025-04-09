"use client";

import { useState } from "react";
import { useFlashcardLists } from "@/contexts/FlashcardListsContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function FlashcardLists() {
  const { lists, currentListId, createList, deleteList, setCurrentList } =
    useFlashcardLists();
  const [newListName, setNewListName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList(newListName.trim());
      setNewListName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Flashcard Lists</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="List name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateList();
                  }
                }}
              />
              <Button onClick={handleCreateList} className="w-full">
                Create List
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {lists.map((list) => (
          <Card
            key={list._id}
            className={cn(
              "p-4 flex items-center justify-between",
              currentListId === list._id && "border-primary"
            )}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentList(list._id)}
                className={cn(
                  "flex-1 justify-start",
                  currentListId === list._id && "text-primary"
                )}
              >
                {currentListId === list._id && (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {list.name}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteList(list._id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
        {lists.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No lists created yet. Create your first list to get started!
          </p>
        )}
      </div>
    </div>
  );
}
