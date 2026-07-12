'use client';

import * as React from 'react';
import { ArrowRight, Pencil, Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from '@nextpayments/ui/components/button';
import { IconButton } from '@nextpayments/ui/components/icon-button';
import { ButtonGroup } from '@nextpayments/ui/components/button-group';
import { Skeleton } from '@nextpayments/ui/components/skeleton';
import { Notice } from '@nextpayments/ui/components/notice';
import { DataTable, type DataTableColumn } from '@nextpayments/ui/components/data-table';
import { EmptyState } from '@nextpayments/ui/components/empty-state';
import { ToggleSwitch } from '@nextpayments/ui/components/toggle-switch';
import { Checkbox } from '@nextpayments/ui/components/checkbox';
import { ActionIcon } from '@nextpayments/ui/components/action-icon';
import { Tabs, type TabItem } from '@nextpayments/ui/components/tabs';
import { Sheet } from '@nextpayments/ui/components/sheet';

const VARIANTS = [
  'primary',
  'gradient',
  'secondary',
  'outline',
  'ghost',
  'subtle',
  'destructive',
  'link',
] as const;

const SIZES = ['sm', 'md', 'lg', 'xl'] as const;

type SampleRow = { name: string; value: string };

const SAMPLE_COLUMNS: ReadonlyArray<DataTableColumn<SampleRow>> = [
  { key: 'name', header: 'Name', render: (row) => row.name },
  {
    key: 'value',
    header: 'Value',
    render: (row) => row.value,
    cellClassName: 'font-mono text-xs',
  },
];

const SAMPLE_ROWS: ReadonlyArray<SampleRow> = [
  { name: 'Orders', value: '18,402' },
  { name: 'Volume', value: '$2.84M' },
  { name: 'Fee', value: '0.5%' },
];

const SAMPLER_TABS: ReadonlyArray<TabItem> = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-subtle)]">
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export default function UiKitPage() {
  const [loading, setLoading] = React.useState(false);
  const [samplerToggle, setSamplerToggle] = React.useState(false);
  const [samplerChecked, setSamplerChecked] = React.useState(false);
  const [samplerTab, setSamplerTab] = React.useState<string>(SAMPLER_TABS[0]!.value);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  return (
    <main className="mx-auto max-w-4xl space-y-12 px-6 py-20">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Button — UI Kit</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Variant × size × state matrix. Toggle the theme to QA Dark/Light.
        </p>
      </header>

      <Section title="Variants">
        {VARIANTS.map((v) => (
          <Button key={v} variant={v}>
            {v}
          </Button>
        ))}
      </Section>

      <Section title="Sizes">
        {SIZES.map((s) => (
          <Button key={s} size={s}>
            Size {s}
          </Button>
        ))}
      </Section>

      <Section title="With icons">
        <Button leftIcon={<Plus className="h-4 w-4" />}>Create invoice</Button>
        <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
          Continue
        </Button>
        <Button variant="gradient" rightIcon={<ArrowRight className="h-4 w-4" />}>
          Get Started Free
        </Button>
      </Section>

      <Section title="States">
        <Button disabled>Disabled</Button>
        <Button loading>Saving</Button>
        <Button
          variant="secondary"
          loading={loading}
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
          }}
        >
          Click to load
        </Button>
      </Section>

      <Section title="Icon buttons">
        <IconButton aria-label="Settings" icon={<Settings className="h-4 w-4" />} />
        <IconButton
          aria-label="Delete"
          variant="destructive"
          icon={<Trash2 className="h-4 w-4" />}
        />
        <IconButton aria-label="Add" variant="outline" icon={<Plus className="h-4 w-4" />} />
      </Section>

      <Section title="Button group">
        <ButtonGroup>
          <Button variant="outline">Day</Button>
          <Button variant="outline">Week</Button>
          <Button variant="outline">Month</Button>
        </ButtonGroup>
      </Section>

      <Section title="Full width">
        <div className="w-full max-w-sm space-y-3">
          <Button fullWidth>Continue</Button>
          <Button variant="outline" fullWidth>
            Continue with Google
          </Button>
        </div>
      </Section>

      <Section title="asChild (polymorphic)">
        <Button asChild variant="link">
          <a href="https://example.com" target="_blank" rel="noreferrer">
            Rendered as an anchor
          </a>
        </Button>
      </Section>

      <Section title="Skeleton">
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </Section>

      <Section title="Notice tones">
        <div className="flex w-full flex-col gap-3">
          <Notice tone="info">Info — neutral guidance.</Notice>
          <Notice tone="success">Success — action completed.</Notice>
          <Notice tone="warning">Warning — needs attention.</Notice>
          <Notice tone="danger">Danger — something failed.</Notice>
        </div>
      </Section>

      <Section title="DataTable states">
        <div className="flex w-full flex-col gap-6">
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-text-muted)]">Loading</p>
            <DataTable
              columns={SAMPLE_COLUMNS}
              rows={[]}
              getRowKey={(r) => r.name}
              loading
              loadingRows={3}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-text-muted)]">Empty</p>
            <DataTable
              columns={SAMPLE_COLUMNS}
              rows={[]}
              getRowKey={(r) => r.name}
              empty={<EmptyState title="Nothing here yet" />}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-text-muted)]">Rows</p>
            <DataTable columns={SAMPLE_COLUMNS} rows={SAMPLE_ROWS} getRowKey={(r) => r.name} />
          </div>
        </div>
      </Section>

      <Section title="Focus-ring sampler">
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Sample button</Button>
            <IconButton aria-label="Sample" icon={<Pencil className="h-4 w-4" />} />
            <ToggleSwitch
              aria-label="Sample toggle"
              checked={samplerToggle}
              onCheckedChange={setSamplerToggle}
            />
            <Checkbox
              aria-label="Sample checkbox"
              checked={samplerChecked}
              onChange={(e) => setSamplerChecked(e.target.checked)}
            />
            <ActionIcon aria-label="Sample action" icon={<Settings className="h-4 w-4" />} />
            <Tabs
              aria-label="Sample tabs"
              items={SAMPLER_TABS}
              value={samplerTab}
              onValueChange={setSamplerTab}
            />
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            Tab through — every control shows the same accent ring.
          </p>
        </div>
      </Section>

      <Section title="Sheet">
        <Button onClick={() => setSheetOpen(true)}>Open sheet</Button>
        <Sheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Sheet showcase"
          closeLabel="Close sheet"
        >
          <p className="text-sm text-[var(--color-text-muted)]">
            Elevation via --shadow-overlay-up; tab to the close button for the focus ring.
          </p>
        </Sheet>
      </Section>
    </main>
  );
}
