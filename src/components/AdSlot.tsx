interface AdSlotProps {
  variant: 'top' | 'left' | 'right';
}

export default function AdSlot({ variant }: AdSlotProps) {
  if (variant === 'top') {
    return <div className="ad-slot ad-slot-top" style={{ width: '728px', height: '90px' }} />;
  }
  if (variant === 'left') {
    return <div className="ad-slot ad-slot-left" style={{ width: '160px', height: '600px' }} />;
  }
  return <div className="ad-slot ad-slot-right" style={{ width: '160px', height: '600px' }} />;
}
