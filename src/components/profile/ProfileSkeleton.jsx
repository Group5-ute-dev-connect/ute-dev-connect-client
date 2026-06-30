import React from 'react';
import { Skeleton } from '../common/Skeleton';

export const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto pb-20 animate-pulse">
      {/* Back Button */}
      <div className="mb-6">
        <Skeleton variant="rectangular" width="100px" height="36px" className="rounded-xl" />
      </div>
      
      {/* Cover Image & Basic Info Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl overflow-hidden mb-8">
        <div className="h-48 bg-gray-300 dark:bg-gray-700 w-full"></div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end -mt-16 md:-mt-20 mb-6">
            <Skeleton variant="circular" width="128px" height="128px" className="border-4 border-white dark:border-gray-800 md:w-40 md:h-40" />
            <div className="mt-4 md:mt-0 flex gap-3">
              <Skeleton variant="rectangular" width="120px" height="40px" className="rounded-xl" />
              <Skeleton variant="rectangular" width="120px" height="40px" className="rounded-xl" />
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2.5 justify-center md:justify-start">
              <Skeleton variant="text" width="200px" height="32px" />
              <Skeleton variant="rectangular" width="60px" height="24px" className="rounded-full" />
            </div>
            <Skeleton variant="text" width="300px" height="20px" className="mx-auto md:mx-0" />
            
            <div className="flex justify-center md:justify-start gap-4 mt-3">
              <Skeleton variant="text" width="100px" height="20px" />
              <Skeleton variant="text" width="100px" height="20px" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-6">
            <Skeleton variant="text" width="100px" height="24px" className="mb-4" />
            <div className="space-y-2">
              <Skeleton variant="text" width="100%" height="14px" />
              <Skeleton variant="text" width="90%" height="14px" />
              <Skeleton variant="text" width="80%" height="14px" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-6 mb-6">
            <Skeleton variant="text" width="150px" height="24px" className="mb-1" />
            <Skeleton variant="text" width="200px" height="14px" />
          </div>
        </div>
      </div>
    </div>
  );
};
