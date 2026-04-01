'use client';

import type { Dispatch, SetStateAction } from 'react';
import { PanelRightClose, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorksheetTheme } from '@/types/worksheet';
import { defaultTheme } from '@/features/worksheets/defaults';

export const ThemeSettingsSidebar = ({
  theme,
  setTheme,
  onClose,
}: {
  theme: WorksheetTheme;
  setTheme: Dispatch<SetStateAction<WorksheetTheme>>;
  onClose?: () => void;
}) => {
  return (
    <aside className="h-full w-72 shrink-0 space-y-4 overflow-auto border-l bg-white p-4">
      <div className="flex items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Appearance</h3>
            <p className="text-xs text-slate-500">Optional styling tweaks</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-7 px-2 text-xs text-slate-600"
          onClick={onClose}
        >
          <PanelRightClose className="h-3.5 w-3.5" />
          Close
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full text-xs"
        onClick={() => setTheme(defaultTheme)}
      >
        Reset theme to default
      </Button>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">
          Heading size
        </label>
        <Input
          type="number"
          min={18}
          max={48}
          value={theme.headingFontSize}
          onChange={(e) =>
            setTheme((t) => ({ ...t, headingFontSize: Number(e.target.value) }))
          }
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">
          Body text size
        </label>
        <Input
          type="number"
          min={12}
          max={24}
          value={theme.bodyFontSize}
          onChange={(e) =>
            setTheme((t) => ({ ...t, bodyFontSize: Number(e.target.value) }))
          }
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Font style</label>
        <Select
          value={theme.fontFamily}
          onValueChange={(value) =>
            setTheme((t) => ({
              ...t,
              fontFamily: value as WorksheetTheme['fontFamily'],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inter">Inter</SelectItem>
            <SelectItem value="lora">Lora</SelectItem>
            <SelectItem value="nunito">Nunito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">
          Section and question spacing
        </label>
        <p className="text-xs text-slate-500">
          Controls spacing in editor preview and export layout.
        </p>
        <Select
          value={theme.spacingPreset}
          onValueChange={(value) =>
            setTheme((t) => ({
              ...t,
              spacingPreset: value as WorksheetTheme['spacingPreset'],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="spacious">Spacious</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Page header</label>
        <p className="text-xs text-slate-500">
          Lesson style matches a typical handout (title and name line).
        </p>
        <Select
          value={theme.headerStyle}
          onValueChange={(value) =>
            setTheme((t) => ({
              ...t,
              headerStyle: value as WorksheetTheme['headerStyle'],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Title and instructions</SelectItem>
            <SelectItem value="lesson">Lesson handout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {theme.headerStyle === 'lesson' ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
          <span className="text-xs text-slate-600">Show name line</span>
          <Button
            type="button"
            variant={theme.showNameLine ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() =>
              setTheme((t) => ({ ...t, showNameLine: !t.showNameLine }))
            }
          >
            {theme.showNameLine ? 'On' : 'Off'}
          </Button>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">
          Answer options layout
        </label>
        <p className="text-xs text-slate-500">
          Multiple choice and true or false in preview and PDF.
        </p>
        <Select
          value={theme.optionLayout}
          onValueChange={(value) =>
            setTheme((t) => ({
              ...t,
              optionLayout: value as WorksheetTheme['optionLayout'],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vertical">Vertical list</SelectItem>
            <SelectItem value="horizontal">Horizontal row</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">
          Question prompt weight
        </label>
        <Select
          value={theme.promptFontWeight}
          onValueChange={(value) =>
            setTheme((t) => ({
              ...t,
              promptFontWeight: value as WorksheetTheme['promptFontWeight'],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="semibold">Semibold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">
          Accent color
        </label>
        <Input
          type="color"
          value={theme.primaryColor}
          onChange={(e) =>
            setTheme((t) => ({ ...t, primaryColor: e.target.value }))
          }
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Main text color</label>
        <Input
          type="color"
          value={theme.textColor}
          onChange={(e) =>
            setTheme((t) => ({ ...t, textColor: e.target.value }))
          }
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">
          Options and secondary text
        </label>
        <p className="text-xs text-slate-500">
          Used for choices, answer lines, and labels in preview and export.
        </p>
        <Input
          type="color"
          value={theme.answerTextColor}
          onChange={(e) =>
            setTheme((t) => ({ ...t, answerTextColor: e.target.value }))
          }
        />
      </div>
    </aside>
  );
};
