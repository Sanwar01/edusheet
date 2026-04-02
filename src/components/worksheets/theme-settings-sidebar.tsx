'use client';

import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { ChevronDown, PanelRightClose, SlidersHorizontal } from 'lucide-react';
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
import { cn } from '@/lib/utils';

function ThemePanelGroup({
  title,
  description,
  defaultOpen = true,
  children,
}: {
  title: string;
  description?: string;
  /** When false, the group starts collapsed. */
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-lg border border-border/60 bg-secondary/60">
      <button
        type="button"
        className="flex w-full items-start gap-2 rounded-lg p-3 text-left transition-colors hover:bg-secondary/80"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open ? 'rotate-0' : '-rotate-90',
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h4>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border/60 px-3 pb-3 pt-3">
          {children}
        </div>
      ) : null}
    </section>
  );
}

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
    <aside className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-4 border-b border-border p-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Appearance
              </h3>
              <p className="text-xs text-muted-foreground">Optional styling tweaks</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-7 px-2 text-xs text-muted-foreground"
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
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain p-4 pt-3 pb-6">
        <ThemePanelGroup
          title="Typography"
          description="Sizes and weight for titles, body copy, and question prompts."
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Heading size
            </label>
            <Input
              type="number"
              min={18}
              max={48}
              value={theme.headingFontSize}
              onChange={(e) =>
                setTheme((t) => ({
                  ...t,
                  headingFontSize: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Body text size
            </label>
            <Input
              type="number"
              min={12}
              max={24}
              value={theme.bodyFontSize}
              onChange={(e) =>
                setTheme((t) => ({
                  ...t,
                  bodyFontSize: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Font style
            </label>
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
            <label className="text-xs font-medium text-muted-foreground">
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
        </ThemePanelGroup>

        <ThemePanelGroup
          title="Layout"
          description="Spacing and how choice lists appear in preview and PDF."
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Section and question spacing
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
            <label className="text-xs font-medium text-muted-foreground">
              Answer options layout
            </label>
            <p className="text-xs text-muted-foreground">
              Multiple choice and true or false.
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
        </ThemePanelGroup>

        <ThemePanelGroup
          title="Page header"
          description="Top of the worksheet in preview and export."
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Style</label>
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
            <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
              <span className="text-xs text-muted-foreground">Show name line</span>
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
        </ThemePanelGroup>

        <ThemePanelGroup
          title="Colors"
          description="Customize the appearance of your worksheet"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
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
            <label className="text-xs font-medium text-muted-foreground">
              Main text color
            </label>
            <Input
              type="color"
              value={theme.textColor}
              onChange={(e) =>
                setTheme((t) => ({ ...t, textColor: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Options and secondary text
            </label>
            <p className="text-xs text-muted-foreground">
              Used for choices, answer lines, response boxes, and labels in
              preview and export.
            </p>
            <Input
              type="color"
              value={theme.answerTextColor}
              onChange={(e) =>
                setTheme((t) => ({ ...t, answerTextColor: e.target.value }))
              }
            />
          </div>
        </ThemePanelGroup>
      </div>
    </aside>
  );
};
