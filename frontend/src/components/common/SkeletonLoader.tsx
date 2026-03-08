import React from 'react';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  children?: React.ReactNode;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
  children,
}) => {
  return (
    <div
      className={`bg-muted rounded animate-pulse ${width} ${height} ${className}`}
    >
      {children}
    </div>
  );
};

export default SkeletonLoader;
