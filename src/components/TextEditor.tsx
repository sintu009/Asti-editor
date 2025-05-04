
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface TextEditorProps {
  onAddText: (text: string, options: TextOptions) => void;
  onCancel: () => void;
  initialText?: string;
  initialOptions?: Partial<TextOptions>;
}

export interface TextOptions {
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
}

const TextEditor = ({ 
  onAddText, 
  onCancel, 
  initialText = "", 
  initialOptions 
}: TextEditorProps) => {
  const [text, setText] = useState(initialText);
  const [options, setOptions] = useState<TextOptions>({
    fontSize: initialOptions?.fontSize || 16,
    fontFamily: initialOptions?.fontFamily || "Arial",
    color: initialOptions?.color || "#000000",
    bold: initialOptions?.bold || false,
    italic: initialOptions?.italic || false
  });
  
  const handleSave = () => {
    if (!text.trim()) {
      toast.error("Text cannot be empty");
      return;
    }
    
    onAddText(text, options);
    toast.success("Text added successfully");
  };
  
  return (
    <div className="bg-white p-4 rounded-md shadow-md border border-gray-200 max-w-md w-full">
      <h3 className="text-lg font-medium mb-3">Edit Text</h3>
      
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text here"
        className="mb-4 min-h-[100px]"
      />
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="fontFamily" className="text-sm">Font</Label>
          <select
            id="fontFamily"
            value={options.fontFamily}
            onChange={(e) => setOptions({...options, fontFamily: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="color" className="text-sm">Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              id="color"
              value={options.color}
              onChange={(e) => setOptions({...options, color: e.target.value})}
              className="w-10 h-10 p-1"
            />
            <Input
              type="text"
              value={options.color}
              onChange={(e) => setOptions({...options, color: e.target.value})}
              className="flex-grow"
            />
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <Label htmlFor="fontSize" className="text-sm flex justify-between">
          Font Size <span>{options.fontSize}px</span>
        </Label>
        <Slider
          id="fontSize"
          min={8}
          max={72}
          step={1}
          value={[options.fontSize]}
          onValueChange={(value) => setOptions({...options, fontSize: value[0]})}
          className="my-2"
        />
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={options.bold ? "default" : "outline"}
          size="sm"
          onClick={() => setOptions({...options, bold: !options.bold})}
          className="flex-1"
        >
          Bold
        </Button>
        
        <Button
          type="button"
          variant={options.italic ? "default" : "outline"}
          size="sm"
          onClick={() => setOptions({...options, italic: !options.italic})}
          className="flex-1"
        >
          Italic
        </Button>
      </div>
      
      <div className="text-sm mb-4">
        <p className="mb-2">Preview:</p>
        <div 
          className="border rounded-md p-3 min-h-[50px]"
          style={{
            fontFamily: options.fontFamily,
            fontSize: `${options.fontSize}px`,
            color: options.color,
            fontWeight: options.bold ? 'bold' : 'normal',
            fontStyle: options.italic ? 'italic' : 'normal'
          }}
        >
          {text || "Preview text"}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          <Check className="w-4 h-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default TextEditor;
