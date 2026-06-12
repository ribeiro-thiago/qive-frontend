"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ComboboxBaseProps<T> = {
  items: T[];
  multiple?: boolean;
  value?: T[] | T;
  onValueChange?: (value: T[] | T) => void;
  itemToStringValue?: (item: T) => string;
  anchorRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
};

type ComboboxContextType<T> = {
  items: T[];
  filteredItems: T[];
  multiple: boolean;
  value: T[] | T | undefined;
  setValue: (value: T[] | T) => void;
  itemToStringValue: (item: T) => string;
  inputValue: string;
  setInputValue: (v: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
};

const ComboboxContext = React.createContext<ComboboxContextType<any> | null>(
  null
);

function useComboboxContext<T>() {
  const ctx = React.useContext(ComboboxContext) as ComboboxContextType<T> | null;
  if (!ctx) {
    throw new Error("Combobox subcomponent must be used within <Combobox>");
  }
  return ctx;
}

function getComboboxItemKey<T>(
  item: T,
  itemToStringValue: (item: T) => string
): string {
  if (item !== null && typeof item === "object" && "id" in item) {
    return String(item.id);
  }
  return itemToStringValue(item);
}

export function Combobox<T>({
  items,
  multiple = false,
  value,
  onValueChange,
  itemToStringValue,
  anchorRef: anchorRefProp,
  children,
}: ComboboxBaseProps<T>) {
  const [internalValue, setInternalValue] = React.useState<T[] | T | undefined>(
    value
  );
  const [inputValue, setInputValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const internalAnchorRef = React.useRef<HTMLElement | null>(null);
  const anchorRef = anchorRefProp ?? internalAnchorRef;
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const stringifier = React.useMemo(
    () => itemToStringValue ?? ((item: any) => String(item ?? "")),
    [itemToStringValue]
  );

  const currentValue = value !== undefined ? value : internalValue;

  const setValue = (v: T[] | T) => {
    if (onValueChange) onValueChange(v);
    setInternalValue(v);
  };

  const filteredItems = React.useMemo(() => {
    const selectedKeys = new Set<string>();
    if (multiple && Array.isArray(currentValue)) {
      currentValue.forEach((item) => {
        selectedKeys.add(getComboboxItemKey(item, stringifier));
      });
    }

    let list = items.filter(
      (item) => !selectedKeys.has(getComboboxItemKey(item, stringifier))
    );

    if (inputValue) {
      const lower = inputValue.toLowerCase();
      list = list.filter((item) =>
        stringifier(item).toLowerCase().includes(lower)
      );
    }

    return list;
  }, [items, inputValue, stringifier, multiple, currentValue]);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, anchorRef]);

  const ctx: ComboboxContextType<T> = {
    items,
    filteredItems,
    multiple,
    value: currentValue,
    setValue,
    itemToStringValue: stringifier,
    inputValue,
    setInputValue,
    open,
    setOpen,
    anchorRef,
    contentRef,
  };

  return (
    <ComboboxContext.Provider value={ctx}>
      <div className="relative w-full">{children}</div>
    </ComboboxContext.Provider>
  );
}

/** Altura de uma opção (py-2 + text-sm) + padding vertical da lista (py-1). */
const COMBOBOX_OPTION_ROW_HEIGHT_PX = 36;
const COMBOBOX_LIST_VERTICAL_PADDING_PX = 8;

function getMaxHeightForVisibleOptions(visibleOptions: number) {
  return (
    visibleOptions * COMBOBOX_OPTION_ROW_HEIGHT_PX +
    COMBOBOX_LIST_VERTICAL_PADDING_PX
  );
}

type ComboboxAnchorProps = React.HTMLAttributes<HTMLDivElement>;

export function ComboboxAnchor({
  className,
  onClick,
  children,
  ...props
}: ComboboxAnchorProps) {
  const { anchorRef, setOpen } = useComboboxContext<any>();

  return (
    <div
      {...props}
      ref={anchorRef as React.RefObject<HTMLDivElement>}
      className={cn("relative w-full", className)}
      onClick={(event) => {
        setOpen(true);
        onClick?.(event);
      }}
    >
      {children}
    </div>
  );
}

export function ComboboxInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  const { inputValue, setInputValue, setOpen } = useComboboxContext<any>();

  return (
    <input
      {...props}
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        props.onChange?.(e);
        setOpen(true);
      }}
      onFocus={(e) => {
        setOpen(true);
        props.onFocus?.(e);
      }}
      className={
        props.className ??
        "w-full h-9 rounded-md border border-border bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0C3CF7]"
      }
    />
  );
}

type ComboboxContentProps = React.HTMLAttributes<HTMLDivElement> & {
  portal?: boolean;
  /** Quando definido, renderiza o dropdown dentro do container (ex.: DialogContent) para funcionar com focus trap. */
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  maxVisibleOptions?: number;
};

export function ComboboxContent({
  portal: usePortal = false,
  portalContainerRef,
  maxVisibleOptions,
  className,
  style,
  ...props
}: ComboboxContentProps) {
  const { open, anchorRef, contentRef } = useComboboxContext<any>();
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const [positionMode, setPositionMode] = React.useState<"fixed" | "absolute">(
    "fixed"
  );

  const updatePosition = React.useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const anchorRect = anchor.getBoundingClientRect();
    const container = portalContainerRef?.current;

    if (container) {
      const containerRect = container.getBoundingClientRect();
      setPositionMode("absolute");
      setPosition({
        top: anchorRect.bottom - containerRect.top + container.scrollTop + 4,
        left: anchorRect.left - containerRect.left + container.scrollLeft,
        width: anchorRect.width,
      });
      return;
    }

    setPositionMode("fixed");
    setPosition({
      top: anchorRect.bottom + 4,
      left: anchorRect.left,
      width: anchorRect.width,
    });
  }, [anchorRef, portalContainerRef]);

  React.useEffect(() => {
    if (!open || !usePortal) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, usePortal, updatePosition]);

  if (!open) return null;

  const maxHeightStyle =
    maxVisibleOptions !== undefined
      ? { maxHeight: getMaxHeightForVisibleOptions(maxVisibleOptions) }
      : undefined;

  const content = (
    <div
      ref={(node) => {
        contentRef.current = node;
      }}
      {...props}
      className={cn(
        usePortal
          ? cn(
              "z-[100] overflow-y-auto overflow-x-hidden overscroll-contain rounded-md border border-border bg-white shadow-lg",
              positionMode === "absolute" ? "absolute" : "fixed"
            )
          : "absolute left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto overflow-x-hidden overscroll-contain rounded-md border border-border bg-white shadow-lg",
        className
      )}
      style={{
        ...style,
        ...(usePortal
          ? {
              top: position.top,
              left: position.left,
              width: position.width,
              ...maxHeightStyle,
            }
          : maxHeightStyle),
      }}
      onWheel={(event) => event.stopPropagation()}
    >
      {props.children}
    </div>
  );

  if (usePortal && typeof document !== "undefined") {
    const portalTarget = portalContainerRef?.current ?? document.body;
    return createPortal(content, portalTarget);
  }

  return content;
}

export function ComboboxEmpty(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { filteredItems } = useComboboxContext<any>();
  if (filteredItems.length > 0) return null;
  return (
    <div
      {...props}
      className={
        props.className ??
        "px-3 py-2 text-sm text-[#5F6572]"
      }
    >
      {props.children || "No items found."}
    </div>
  );
}

type ComboboxListProps<T> = {
  children: (item: T) => React.ReactNode;
};

export function ComboboxList<T>({ children }: ComboboxListProps<T>) {
  const { filteredItems, itemToStringValue } = useComboboxContext<T>();
  return (
    <div role="listbox" className="py-1">
      {filteredItems.map((item) => (
        <div key={getComboboxItemKey(item, itemToStringValue)}>
          {children(item)}
        </div>
      ))}
    </div>
  );
}

type ComboboxItemProps<T> = {
  value: T;
  children: React.ReactNode;
  onClick?: () => void;
};

export function ComboboxItem<T>({
  value,
  children,
  onClick,
}: ComboboxItemProps<T>) {
  const {
    multiple,
    setValue,
    value: currentValue,
    itemToStringValue,
    setInputValue,
    setOpen,
  } = useComboboxContext<T>();

  const valueKey = getComboboxItemKey(value, itemToStringValue);

  const handleSelect = () => {
    if (multiple) {
      const arr = Array.isArray(currentValue) ? currentValue : [];
      const exists = arr.some(
        (item) => getComboboxItemKey(item, itemToStringValue) === valueKey
      );
      if (exists) {
        setValue(
          arr.filter(
            (item) => getComboboxItemKey(item, itemToStringValue) !== valueKey
          ) as any
        );
      } else {
        setValue([...arr, value] as any);
        setInputValue("");
      }
    } else {
      setValue(value as any);
      setInputValue("");
      setOpen(false);
    }
    onClick?.();
  };

  const isSelected = React.useMemo(() => {
    if (multiple) {
      return (
        Array.isArray(currentValue) &&
        currentValue.some(
          (item) => getComboboxItemKey(item, itemToStringValue) === valueKey
        )
      );
    }
    return getComboboxItemKey(currentValue as T, itemToStringValue) === valueKey;
  }, [currentValue, itemToStringValue, multiple, valueKey]);

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        handleSelect();
      }}
      className="w-full px-3 py-2 text-left text-sm hover:bg-[#F5F5F6] cursor-pointer"
    >
      {children}
    </button>
  );
}

// Múltipla seleção com chips – API simplificada

type ComboboxChipsProps = React.HTMLAttributes<HTMLDivElement>;

export function ComboboxChips({
  children,
  className,
  onClick,
  ...props
}: ComboboxChipsProps) {
  const { setOpen } = useComboboxContext<any>();

  return (
    <div
      {...props}
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-sm shadow-sm focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#0C3CF7]",
        className
      )}
      onClick={(event) => {
        setOpen(true);
        onClick?.(event);
      }}
    >
      {children}
    </div>
  );
}

export function ComboboxValue(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      {...props}
      className={props.className ?? "flex flex-wrap items-center gap-1"}
    >
      {props.children}
    </div>
  );
}

type ComboboxChipProps = {
  children: React.ReactNode;
};

export function ComboboxChip({ children }: ComboboxChipProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#F3F5FF] px-2 py-0.5 text-xs font-medium text-[#0C3CF7]">
      {children}
    </span>
  );
}

type ComboboxChipsInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function ComboboxChipsInput(props: ComboboxChipsInputProps) {
  const { inputValue, setInputValue, setOpen } = useComboboxContext<any>();
  return (
    <input
      {...props}
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        setOpen(true);
        props.onChange?.(e);
      }}
      onFocus={(e) => {
        setOpen(true);
        props.onFocus?.(e);
      }}
      className={
        props.className ??
        "flex-1 min-w-[80px] border-0 bg-transparent text-sm outline-none"
      }
    />
  );
}

