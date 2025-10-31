'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { approveProvider, rejectProvider } from '@/lib/actions';

export function ProviderActions({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveProvider(userId);
      if (result.success) {
        toast({
          title: 'Provider Approved',
          description: 'The provider can now log in and add listings.',
        });
        // The revalidatePath in the action will handle data refresh
      } else {
        toast({
          variant: 'destructive',
          title: 'Approval Failed',
          description: result.message,
        });
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectProvider(userId);
      if (result.success) {
        toast({
          title: 'Provider Rejected',
          description: 'The provider registration has been deleted.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Rejection Failed',
          description: result.message,
        });
      }
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" disabled={isPending}>View</Button>
      <Button size="sm" onClick={handleApprove} disabled={isPending}>
        {isPending ? 'Approving...' : 'Approve'}
      </Button>
      <Button variant="destructive" size="sm" onClick={handleReject} disabled={isPending}>
        {isPending ? 'Rejecting...' : 'Reject'}
      </Button>
    </>
  );
}
