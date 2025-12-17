"use client";
import { useEffect, useState } from "react";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomInputFieldProps {
  name: string;
  label: string;
  type: string;
  value: string | File | null | undefined | string[] | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  endPoint?: string;
  previewUpadte?: string | File | null | undefined | string[] | number;
  radio_value?: { name: string; value: string | number }[]; // <-- Add this line
  selectOptions?: Option[];
  disabled?: boolean;
  required?: boolean;
}

interface Option {
  id: number | string;
  name: string;
}

export default function FormGenerator({
  name,
  label,
  type,
  value,
  onChange,
  endPoint,
  previewUpadte,
  radio_value,
  selectOptions = [],
  disabled = false,
  required = false,
}: CustomInputFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const selectedOption = options.find(opt => String(opt.id) === String(value));
  const [open, setOpen] = useState(false);


  useEffect(() => {
    if (type === "selector" && endPoint) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/${endPoint}`);
          const data = await response.json();
          setOptions(data.data);
        } catch (error) {
          console.error("Error fetching selector data:", error);
        }
      };
      fetchData();
    }
  }, [type, endPoint]);

   useEffect(() => {
        if (type === 'selector' && selectOptions.length > 0) {
            setOptions(selectOptions);
        }
    }, [type, selectOptions]);


  useEffect(() => {
    if (type === "file" && value === null) {
      setPreview(null);
    }
  }, [type, value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
    onChange(e);
  };

  const renderLabel = () => (
    <Label htmlFor={name} className="flex items-center gap-1">
      {label}
      {required && <span className="w-2 h-2 text-red-500 text-[15px]">*</span>}
    </Label>
  );

  if (type === "radio" && Array.isArray(radio_value)) {
    return (
      <div className="space-y-2">
        {renderLabel()}
        <div className="flex flex-row gap-4 ">
          {radio_value.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={String(value) === String(opt.value)}
                onChange={onChange}
                className="accent-primary"
              />
              <span>{opt.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className="space-y-2">
        {renderLabel()}
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={!!value}
          onChange={onChange}
          className="accent-primary"
        />
      </div>
    );
  }

  if (type === "file") {
    return (
      <div className="space-y-2">
        {renderLabel()}
        <label
          htmlFor={`file-input-${name}`}
          className="flex items-center justify-center gap-2 p-4 border border-dashed border-gray-300 rounded-md cursor-pointer text-sm"
        >
          <UploadIcon className="w-5 h-5" />
          <span>Choose File</span>
        </label>
        <input
          id={`file-input-${name}`}
          type="file"
          name={name}
          onChange={handleFileChange}
          className="hidden"
        />
        {previewUpadte && typeof previewUpadte === "string" && (
          <img
            src={`${import.meta.env.VITE_IMAGE_BASE}/${previewUpadte}`}
            alt="Uploaded Preview"
            className="max-w-full max-h-[200px] mt-2 border rounded"
          />
        )}
        {preview && (
          <div className="mt-2 flex flex-col items-center">
            <img
              src={preview}
              alt="Live Preview"
              className="max-w-full max-h-[200px] border rounded"
            />
            <span className="text-xs text-gray-500 mt-1">Preview</span>
          </div>
        )}
      </div>
    );
  }

  if (type === "switch") {
    return (
      <div className="space-y-2">
        {renderLabel()}
        <Select
          onValueChange={(val) =>
            onChange({
              target: {
                name,
                value: val,
              },
            } as React.ChangeEvent<HTMLInputElement>)
          }
          value={value?.toString() ?? ""}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (type === "selector") {
    return (
      <div className="space-y-2">
        {renderLabel()}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between h-12 bg-white hover:bg-gray-50"
              aria-expanded={open}
              disabled={disabled}
            >
              {selectedOption ? selectedOption.name : `Select ${label}`}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white">
            <Command className="bg-white">
              <CommandInput
                placeholder={`Search ${label}...`}
                className="h-9"
              />
              <CommandList className="bg-white">
              <CommandEmpty>No option found.</CommandEmpty>
                <CommandGroup className="bg-white">
                  {options.map((opt) => (
                    <CommandItem
                      key={opt.id}
                      value={opt.name}
                      className="hover:bg-gray-100"
                      onSelect={() => {
                        onChange({
                          target: {
                            name,
                            value: String(opt.id),
                          },
                        } as React.ChangeEvent<HTMLInputElement>);
                        setOpen(false);
                      }}
                    >
                      {opt.name}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          String(opt.id) === String(value)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
        </PopoverContent>
      </Popover>
    </div>
    );
  }

  return (
    <div className="space-y-2">
      {renderLabel()}
      {type === "textarea" ? (
      <textarea
        name={name}
        value={typeof value === "string" ? value : ""}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({
          ...e,
          target: {
          ...e.target,
          name: name,
          value: e.target.value,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>);
        }}
        rows={20}
        className="w-full min-h-[120px] max-h-[300px] resize-y rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white px-4 py-3 text-sm shadow-sm transition placeholder:text-gray-400"
        placeholder={`Enter ${label}`}
      />
      ) : (
      <Input
        type={type}
        name={name}
        value={typeof value === "string" || typeof value === "number" ? value : ""}
        onChange={onChange}
        className="w-full h-12 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white px-4 py-2 text-sm shadow-sm transition placeholder:text-gray-400"
        placeholder={`Enter ${label}`}
      />
      )}
    </div>
  );
}
