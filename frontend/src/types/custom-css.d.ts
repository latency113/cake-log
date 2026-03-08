import React from 'react';

declare module 'react' {
  interface CSSProperties {
    '--left-position'?: string;
    '--animation-duration'?: string;
    '--icon-size'?: string;
    '--icon-color'?: string;
    '--animation-delay'?: string;
    '--initial-opacity'?: string;
  }
}