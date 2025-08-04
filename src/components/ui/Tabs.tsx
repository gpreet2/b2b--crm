import React, { createContext, useContext, useState } from 'react';

import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
};

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  defaultValue?: string;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children?: React.ReactNode;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      tabs,
      activeTab,
      onTabChange,
      variant = 'default',
      value,
      onValueChange,
      children,
      defaultValue,
      ...props
    },
    ref
  ) => {
    // Handle both old API (tabs prop) and new API (children with TabsList/TabsTrigger)
    const isLegacyAPI = tabs && activeTab && onTabChange;

    // For new API, manage internal state if no controlled value is provided
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const currentValue = value || activeTab || internalValue;
    const handleValueChange = onValueChange || onTabChange || setInternalValue;

    const variants = {
      default: 'border-b border-border',
      pills: 'space-x-1',
      underline: 'border-b border-border',
    };

    const tabVariants = {
      default: {
        base: 'px-4 py-2 text-sm font-medium border-b-2 border-transparent',
        active: 'border-primary text-primary',
        inactive: 'text-secondary-text hover:text-primary-text hover:border-border',
        disabled: 'text-muted cursor-not-allowed',
      },
      pills: {
        base: 'px-3 py-2 text-sm font-medium rounded-md',
        active: 'bg-primary text-white',
        inactive: 'text-secondary-text hover:text-primary-text hover:bg-accent',
        disabled: 'text-muted cursor-not-allowed',
      },
      underline: {
        base: 'px-4 py-2 text-sm font-medium border-b-2 border-transparent',
        active: 'border-primary text-primary',
        inactive: 'text-secondary-text hover:text-primary-text hover:border-border',
        disabled: 'text-muted cursor-not-allowed',
      },
    };

    // Only try to find active tab content if using legacy API and tabs exist
    const activeTabContent =
      isLegacyAPI && tabs ? tabs.find(tab => tab.id === currentValue)?.content : null;

    const contextValue: TabsContextType = {
      value: currentValue,
      onValueChange: handleValueChange,
    };

    return (
      <TabsContext.Provider value={contextValue}>
        <div className='w-full' {...props}>
          {isLegacyAPI ? (
            // Legacy API with tabs prop
            <>
              <div ref={ref} className={cn('flex', variants[variant], className)}>
                {tabs?.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && handleValueChange?.(tab.id)}
                    className={cn(
                      tabVariants[variant].base,
                      currentValue === tab.id
                        ? tabVariants[variant].active
                        : tab.disabled
                          ? tabVariants[variant].disabled
                          : tabVariants[variant].inactive,
                      'transition-colors duration-200'
                    )}
                    disabled={tab.disabled}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {activeTabContent ? <div className='mt-4'>{activeTabContent}</div> : null}
            </>
          ) : (
            // New API with children
            <div ref={ref} className={className}>
              {children}
            </div>
          )}
        </div>
      </TabsContext.Provider>
    );
  }
);

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    />
  );
});

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabsContext();
    const isSelected = selectedValue === value;

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
          isSelected ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50',
          className
        )}
        data-state={isSelected ? 'active' : 'inactive'}
        onClick={() => onValueChange(value)}
        {...props}
      />
    );
  }
);

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext();
    const isSelected = selectedValue === value;

    if (!isSelected) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        data-state={isSelected ? 'active' : 'inactive'}
        {...props}
      />
    );
  }
);

Tabs.displayName = 'Tabs';
TabsList.displayName = 'TabsList';
TabsTrigger.displayName = 'TabsTrigger';
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
