import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../select";

describe("Select", () => {
  const setup = () => {
    return render(
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  it("renders with default value", () => {
    setup();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("shows options when clicked", async () => {
    setup();
    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Orange")).toBeInTheDocument();
  });

  it("changes value when option is selected", async () => {
    setup();
    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    const bananaOption = screen.getByText("Banana");
    await userEvent.click(bananaOption);

    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
  });

  it("renders with different trigger sizes", () => {
    render(
      <Select>
        <SelectTrigger size="sm">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("data-[size=sm]:h-8");
  });

  it("displays placeholder when no value is selected", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose an option..." />
        </SelectTrigger>
      </Select>
    );

    expect(screen.getByText("Choose an option...")).toBeInTheDocument();
  });
});
