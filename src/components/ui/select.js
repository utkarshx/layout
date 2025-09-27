import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { ChevronDown, Check } from 'lucide-react';

export const Select = ({ value, onValueChange, children, ...props }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
          {...props}
        >
          {value || "Select..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="max-h-60 overflow-auto">
          {React.Children.map(children, (child) =>
            React.cloneElement(child, {
              onSelect: (selectedValue) => {
                onValueChange(selectedValue);
                setOpen(false);
              },
              isSelected: child.props.value === value,
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const SelectItem = ({ value, children, onSelect, isSelected, ...props }) => {
  return (
    <div
      className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-700 hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-white"
      onClick={() => onSelect(value)}
      {...props}
    >
      <Check className={`mr-2 h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
      {children}
    </div>
  );
};

export const SelectContent = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

export const SelectTrigger = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

export const SelectValue = ({ placeholder, ...props }) => {
  return <span {...props}>{placeholder}</span>;
};
