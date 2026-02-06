import React from 'react';
import { DeviceType } from '../../types/survey';

// Menu images for desktop users
const MENU_IMAGES = [
  '/images/Gray Illustrative Restaurant Menu (2).png',
  '/images/Gray Illustrative Restaurant Menu (3).png',
];

interface MenuDisplayProps {
  deviceType: DeviceType;
  menuImageIndex: number;
}

export function MenuDisplay({ deviceType, menuImageIndex }: MenuDisplayProps) {
  if (deviceType === 'mobile') {
    return (
      <div className="text-center space-y-6 p-8">
        <h2 className="text-xl font-bold text-gray-900">AR Menu Experience</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4 text-left">
          <p className="text-gray-700 font-medium">Instructions:</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Download the TruMenu app using the link below.</li>
            <li>Open the app and search for <span className="font-semibold">"Ramen Yama"</span>.</li>
            <li>Browse the AR menu, then return here to continue.</li>
          </ol>
        </div>
        <a
          href="https://apps.apple.com/us/app/trumenu/id6447320918"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-byu-navy text-white py-3 px-6 rounded-lg font-medium hover:bg-byu-royal transition-colors"
        >
          Click here for AR Menu
        </a>
        <p className="text-sm text-gray-500">
          After viewing the menu in AR, continue to select your choice.
        </p>
      </div>
    );
  }

  // Desktop: show the randomly selected menu image
  const selectedImage = MENU_IMAGES[menuImageIndex];

  return (
    <div className="flex flex-col items-center">
      <img
        src={selectedImage}
        alt="Restaurant Menu"
        className="max-w-full h-auto rounded-lg shadow-lg"
      />
    </div>
  );
}

export { MENU_IMAGES };
