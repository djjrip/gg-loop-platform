import React from 'react';

/**
 * LavaLampBackground
 * Subtle animated background with soft blobs that morph and float
 * Designed to be low-cost, accessible (respects prefers-reduced-motion)
 */
export default function LavaLampBackground() {
  return (
    <div aria-hidden="true" className="lava-lamp absolute inset-0 pointer-events-none -z-10">
      <div className="lava-layer">
        <div className="lava-blob lava-blob-1" />
        <div className="lava-blob lava-blob-2" />
        <div className="lava-blob lava-blob-3" />
        <div className="lava-blob lava-blob-4" />
      </div>
      <div className="lava-overlay" />
    </div>
  );
}
