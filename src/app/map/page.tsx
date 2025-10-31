'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component now just redirects to the new /search page.
export default function OldMapPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/search');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Redirecting to the new search experience...</p>
    </div>
  );
}
