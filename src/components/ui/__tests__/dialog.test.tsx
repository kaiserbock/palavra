import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../dialog";

describe("Dialog", () => {
  const setup = () => {
    return render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Content</div>
          <DialogFooter>
            <button>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  it("renders trigger button", () => {
    setup();
    expect(screen.getByText("Open Dialog")).toBeInTheDocument();
  });

  it("shows dialog content when trigger is clicked", async () => {
    setup();
    const trigger = screen.getByText("Open Dialog");
    await userEvent.click(trigger);

    expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    expect(screen.getByText("Dialog Description")).toBeInTheDocument();
    expect(screen.getByText("Dialog Content")).toBeInTheDocument();
  });

  it("renders close button with correct attributes", async () => {
    setup();
    const trigger = screen.getByText("Open Dialog");
    await userEvent.click(trigger);

    const closeButton = screen.getByRole("button", { name: "Close" });
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveClass("absolute right-4 top-4");
  });

  it("closes dialog when close button is clicked", async () => {
    setup();
    const trigger = screen.getByText("Open Dialog");
    await userEvent.click(trigger);

    const closeButton = screen.getByRole("button", { name: "Close" });
    await userEvent.click(closeButton);

    expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();
  });

  it("renders with custom className", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="custom-class">
          <div>Content</div>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByText("Open");
    await userEvent.click(trigger);

    const content = screen.getByText("Content").parentElement;
    expect(content).toHaveClass("custom-class");
  });

  it("renders header and footer with correct layout classes", async () => {
    setup();
    const trigger = screen.getByText("Open Dialog");
    await userEvent.click(trigger);

    const header = screen
      .getByText("Dialog Title")
      .closest("[class*='flex flex-col']");
    const footer = screen
      .getByText("Close")
      .closest("[class*='flex flex-col-reverse']");

    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });
});
