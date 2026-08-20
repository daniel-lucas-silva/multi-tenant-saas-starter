import type { Device } from '@/shared/hooks/use-breakpoint';

/**
 * AdaptiveLayout — composes the Dock / Board / Stage / Spot zones.
 * Desktop & tablet: Dock (left) | Board (optional) | Stage (flex).
 * Mobile: single visible zone (Board or Stage) + Dock as bottom nav.
 */
export function AdaptiveLayout({
  device,
  dock,
  board,
  stage,
  spot,
  showStageOnMobile,
}: {
  device: Device;
  dock: React.ReactNode;
  board?: React.ReactNode;
  stage: React.ReactNode;
  spot?: React.ReactNode;
  showStageOnMobile?: boolean;
}) {
  const isMobile = device === 'mobile';

  if (isMobile) {
    const showBoard = Boolean(board) && !showStageOnMobile;
    return (
      <div className="bg-background flex h-dvh w-full flex-col overflow-hidden">
        <div
          key={showBoard ? 'board' : 'stage'}
          className="animate-in slide-in-from-right-4 flex min-h-0 flex-1 duration-200"
        >
          {showBoard ? board : stage}
        </div>
        {dock}
        {spot}
      </div>
    );
  }

  return (
    <div className="bg-background flex h-dvh w-full overflow-hidden">
      {dock}
      {board}
      {stage}
      {spot}
    </div>
  );
}
