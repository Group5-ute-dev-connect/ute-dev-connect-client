import React from 'react';

export const Skeleton = ({ className = '', variant = 'rectangular', width, height }) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    text: 'rounded',
  };

  const style = {
    width: width || '100%',
    height: height || '100%',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const PostSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" height="16px" />
          <Skeleton variant="text" width="25%" height="12px" />
        </div>
      </div>
      
      {/* Body */}
      <div className="space-y-2 pt-2">
        <Skeleton variant="text" width="100%" height="14px" />
        <Skeleton variant="text" width="90%" height="14px" />
        <Skeleton variant="text" width="80%" height="14px" />
      </div>

      {/* Footer */}
      <div className="pt-4 flex items-center justify-between">
        <div className="flex space-x-4">
          <Skeleton variant="rectangular" width="60px" height="24px" />
          <Skeleton variant="rectangular" width="60px" height="24px" />
        </div>
        <Skeleton variant="rectangular" width="80px" height="24px" />
      </div>
    </div>
  );
};
