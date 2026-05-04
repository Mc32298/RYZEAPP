import React from 'react';

export function TitleBar() {
  const handleClose = () => window.electronAPI?.closeWindow();
  const handleMinimize = () => window.electronAPI?.minimizeWindow();
  const handleMaximize = () => window.electronAPI?.maximizeWindow();

  return (
    <div 
      className="flex items-center px-4 h-[38px] w-full shrink-0 border-b border-[#2A2820] select-none"
      style={{ 
        backgroundColor: '#1A1814', 
        WebkitAppRegion: 'drag' // Makes the header draggable
      } as React.CSSProperties} 
    >
      {/* macOS Traffic Lights */}
      <div 
        className="flex items-center gap-2" 
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} // Buttons must be non-draggable to register clicks
      >
        <button 
          onClick={handleClose}
          className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 transition-colors"
          title="Close"
        />
        <button 
          onClick={handleMinimize}
          className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 transition-colors"
          title="Minimize"
        />
        <button 
          onClick={handleMaximize}
          className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 transition-colors"
          title="Maximize"
        />
      </div>
      
      {/* Centered App Title */}
      <div className="flex-1 text-center text-xs font-medium text-[#5A5448] font-space-grotesk pointer-events-none tracking-widest">
        RYZE
      </div>
      
      {/* Spacer to keep the title perfectly centered */}
      <div className="w-[52px]"></div> 
    </div>
  );
}
