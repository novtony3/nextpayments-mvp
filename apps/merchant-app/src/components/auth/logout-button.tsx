'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@nextpayments/ui/components/button';

import { ROUTES } from '@/constants/routes';
import { useRouter } from '@/i18n/routing';
import { logoutAction } from '@/lib/auth/actions';

export function LogoutButton() {
  const t = useTranslations('auth.logout');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      loading={isPending}
      onClick={() =>
        startTransition(async () => {
          await logoutAction();
          toast.success(t('success'));
          router.push(ROUTES.LOGIN);
          router.refresh(); // drop cached RSC rendered with the old session
        })
      }
    >
      {t('button')}
    </Button>
  );
}
