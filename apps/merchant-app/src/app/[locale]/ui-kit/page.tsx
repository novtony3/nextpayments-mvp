'use client';

import * as React from 'react';
import { ArrowRight, Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from '@nextpayments/ui/components/button';
import { IconButton } from '@nextpayments/ui/components/icon-button';
import { ButtonGroup } from '@nextpayments/ui/components/button-group';

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
    </main>
  );
}
