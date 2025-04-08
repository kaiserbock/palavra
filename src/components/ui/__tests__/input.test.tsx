import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input";

describe("Input", () => {
  it("renders with default props", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders with different types", () => {
    const { rerender } = render(<Input type="password" />);
    let input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "password");

    rerender(<Input type="email" />);
    input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("handles user input", async () => {
    render(<Input />);
    const input = screen.getByRole("textbox");

    await userEvent.type(input, "Hello, World!");
    expect(input).toHaveValue("Hello, World!");
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-class");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("disabled:opacity-50");
  });

  it("handles placeholder text", () => {
    render(<Input placeholder="Enter text..." />);
    const input = screen.getByPlaceholderText("Enter text...");
    expect(input).toBeInTheDocument();
  });

  it("handles onChange events", async () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");

    expect(handleChange).toHaveBeenCalled();
  });
});
