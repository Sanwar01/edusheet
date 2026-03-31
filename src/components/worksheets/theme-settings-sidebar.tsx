'use client';

import type { Dispatch, SetStateAction } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorksheetTheme } from '@/types/worksheet';

export const ThemeSettingsSidebar = ({
  theme,
  setTheme,
}: {
  theme: WorksheetTheme;
  setTheme: Dispatch<SetStateAction<WorksheetTheme>>;
}) => {
  return (
    <aside className="h-full w-72 shrink-0 space-y-4 overflow-auto border-l bg-white p-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <SlidersHorizontal className="h-4 w-4 text-slate-500" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Appearance</h3>
          <p className="text-xs text-slate-500">Optional styling tweaks</p>
        </div>
      </div>

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
          Spacing density
        </label>
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
        <label className="text-xs font-medium text-slate-600">Text color</label>
        <Input
          type="color"
          value={theme.textColor}
          onChange={(e) =>
            setTheme((t) => ({ ...t, textColor: e.target.value }))
          }
        />
      </div>
    </aside>
  );
};
