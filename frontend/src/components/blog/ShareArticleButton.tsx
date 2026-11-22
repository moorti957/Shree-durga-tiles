'use client';

import { Share2 } from 'lucide-react';

export function ShareArticleButton({ title }: { title: string }) {
  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    window.alert('Link copied to clipboard!');
  };

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="flex items-center gap-1.5 text-gold-dark transition-colors hover:text-gold"
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  );
}
