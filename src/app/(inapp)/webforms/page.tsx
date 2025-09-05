'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForms } from '@/shared/contexts/forms-context';

export default function WebformsPage() {
  const router = useRouter();
  const { menuOrder, lastFormVisited } = useForms();

  useEffect(() => {
    // Redirect to the last visited form or the first form in the menu
    const targetForm = lastFormVisited || menuOrder[0]?.slug;
    
    if (targetForm) {
      router.replace(`/webforms/${targetForm}`);
    } else {
      // Fallback to broker-information if no menu is available
      router.replace('/webforms/broker-information');
    }
  }, [router, lastFormVisited, menuOrder]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading onboarding forms...</p>
      </div>
    </div>
  );
}
