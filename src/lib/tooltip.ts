interface TooltipPosition {
  x: number;
  y: number;
  placement: "top" | "bottom";
}

export function calculateTooltipPosition(
  targetRect: DOMRect,
  tooltipHeight: number,
  containerElement: HTMLDivElement | null
): TooltipPosition {
  const viewportHeight = window.innerHeight;
  const scrollY = window.scrollY || window.pageYOffset;
  const containerRect = containerElement?.getBoundingClientRect();

  if (!containerRect) return { x: 0, y: 0, placement: "bottom" };

  // Calculate space above and below the target relative to the viewport
  const spaceAbove = targetRect.top;
  const spaceBelow = viewportHeight - targetRect.bottom;

  // Default to showing below, but switch to above if there's not enough space below
  const placement =
    spaceBelow >= tooltipHeight || spaceBelow > spaceAbove ? "bottom" : "top";

  // Calculate the center position of the target
  const x = targetRect.left + targetRect.width / 2;

  // Calculate vertical position
  const y =
    placement === "bottom"
      ? targetRect.bottom + scrollY + 8 // 8px gap below
      : targetRect.top + scrollY - tooltipHeight - 8; // 8px gap above

  return { x, y, placement };
}
