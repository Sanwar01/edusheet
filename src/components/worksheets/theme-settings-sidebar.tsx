'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import type { WorksheetTheme } from '@/types/worksheet';

export const ThemeSettingsSidebar = ({
  theme,
  setTheme,
}: {
  theme: WorksheetTheme;
  setTheme: Dispatch<SetStateAction<WorksheetTheme>>;
}) => {
  return (
    <aside className="w-64 shrink-0 space-y-3 overflow-auto border-l bg-card p-4">
      <h3 className="font-semibold">Theme Settings</h3>
      <label className="text-sm text-slate-600">Heading size</label>
      <Input
        type="number"
        value={theme.headingFontSize}
        onChange={(e) =>
          setTheme((t) => ({ ...t, headingFontSize: Number(e.target.value) }))
        }
      />
      <label className="text-sm text-slate-600">Body size</label>
      <Input
        type="number"
        value={theme.bodyFontSize}
        onChange={(e) =>
          setTheme((t) => ({ ...t, bodyFontSize: Number(e.target.value) }))
        }
      />
      <label className="text-sm text-slate-600">Primary color</label>
      <Input
        type="color"
        value={theme.primaryColor}
        onChange={(e) =>
          setTheme((t) => ({ ...t, primaryColor: e.target.value }))
        }
      />
      <label className="text-sm text-slate-600">Text color</label>
      <Input
        type="color"
        value={theme.textColor}
        onChange={(e) => setTheme((t) => ({ ...t, textColor: e.target.value }))}
      />
    </aside>
  );
};
