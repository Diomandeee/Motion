'use client';

import { useState } from 'react';
import { Smartphone, Watch, Compass, Headphones, Settings, BarChart3, Menu, X } from 'lucide-react';

export interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

const TabButton = ({ 
  tab, 
  isActive, 
  onClick,
  mobile = false
}: { 
  tab: Tab; 
  isActive: boolean; 
  onClick: () => void;
  mobile?: boolean;
}) => {
  const Icon = tab.icon;
  
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-3 text-sm font-medium rounded-lg transition-all duration-200 w-full
        ${mobile 
          ? 'px-4 py-3' 
          : 'px-6 py-4'
        }
        ${isActive 
          ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent'
        }
      `}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'} flex-shrink-0`} />
      <div className="text-left min-w-0 flex-1">
        <div className="font-medium truncate">{tab.name}</div>
        <div className="text-xs text-gray-500 mt-0.5 truncate">{tab.description}</div>
      </div>
    </button>
  );
};

export default function TabNavigation({ 
  tabs, 
  activeTab, 
  onTabChange, 
  children 
}: TabNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  const activeTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {activeTabInfo && (
              <>
                <activeTabInfo.icon className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">{activeTabInfo.name}</div>
                  <div className="text-xs text-gray-500">{activeTabInfo.description}</div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <div className="flex h-full">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
              />
            ))}
          </div>
          
          {/* Active Tab Indicator */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-1">Active View</div>
            <div className="text-sm text-gray-600">
              {activeTabInfo?.name || 'Overview'}
            </div>
          </div>
        </div>

        {/* Mobile Drawer Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <div className={`
          lg:hidden fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  mobile={true}
                />
              ))}
            </div>

            {/* Active Tab Indicator for Mobile */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-1">Current View</div>
              <div className="text-sm text-gray-600">
                {activeTabInfo?.name || 'Overview'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </>
  );
}

// Export the available tabs for use in the main dashboard
export const SENSOR_TABS: Tab[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: BarChart3,
    description: 'All sensors summary'
  },
  {
    id: 'watch-sensors',
    name: 'Watch Sensors',
    icon: Watch,
    description: 'Heart rate, Location, Barometer'
  },
  {
    id: 'device-motion',
    name: 'Device Motion',
    icon: Smartphone,
    description: 'Accelerometer & Gyroscope'
  },
  {
    id: 'wrist-motion',
    name: 'Wrist Motion',
    icon: Watch,
    description: 'Apple Watch / WearOS'
  },
  {
    id: 'orientation',
    name: 'Orientation',
    icon: Compass,
    description: 'Euler angles & Quaternions'
  },
  {
    id: 'environmental',
    name: 'Environmental',
    icon: Headphones,
    description: 'Magnetometer & Audio'
  },
  {
    id: 'raw-data',
    name: 'Raw Data',
    icon: Settings,
    description: 'Uncalibrated sensors'
  },
  {
    id: 'diagnostics',
    name: 'Diagnostics',
    icon: Settings,
    description: 'Debug data flow'
  }
]; 