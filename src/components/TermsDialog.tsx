import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/terms/TermsSidebar";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 w-full sm:w-[400px]">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Saved Terms</SheetTitle>
        </SheetHeader>
        <Sidebar className="h-[calc(100%-65px)] border-0 shadow-none" />
      </SheetContent>
    </Sheet>
  );
}
