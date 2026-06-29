'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';

export function PreviewPanel() {
  const { previewUrl } = useProjectStore();
  const [iframeSrc, setIframeSrc] = useState<string>('');

  useEffect(() => {
    if (previewUrl) {
      setIframeSrc(previewUrl);
    }
  }, [previewUrl]);

  return (
    <div className="h-full w-full flex flex-col bg-slate-800">
      {!iframeSrc ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">No Preview Available</p>
            <p className="text-sm">Build and run a project to see the preview here</p>
          </div>
        </div>
      ) : (
        <iframe
          src={iframeSrc}
          className="w-full h-full border-none"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
          title="Live Preview"
        />
      )}
    </div>
  );
}
