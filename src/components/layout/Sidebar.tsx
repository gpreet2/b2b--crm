"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  Cog6ToothIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ShareIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { NavigationItem, navigationConfig } from "@/lib/navigation";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, onClose, ...props }, ref) => {
    const pathname = usePathname();
    const router = useRouter();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Auto-expand parent menu when on a sub-page
    useEffect(() => {
      const newExpanded = new Set<string>();
      navigationConfig.forEach((item) => {
        if (item.expandable && item.subItems) {
          const hasActiveSubItem = item.subItems.some(
            (subItem) => subItem.href === pathname
          );
          if (hasActiveSubItem) {
            newExpanded.add(item.id);
          }
        }
      });
      setExpandedItems(newExpanded);
    }, [pathname]);

    const toggleExpanded = (itemId: string) => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      setExpandedItems(newExpanded);
    };

    const handleMainItemClick = (item: NavigationItem) => {
      if (item.expandable && item.subItems && item.subItems.length > 0) {
        // If the item is expandable and has sub-items, navigate to the first sub-item
        const firstSubItem = item.subItems[0];
        router.push(firstSubItem.href);
        handleNavigation();
      } else {
        // For non-expandable items, just navigate normally
        router.push(item.href);
        handleNavigation();
      }
    };

    const handleNavigation = () => {
      // Close mobile menu when navigating
      if (onClose) {
        onClose();
      }
    };

    const isItemActive = (item: NavigationItem): boolean => {
      if (item.href === pathname) return true;
      if (item.subItems) {
        return item.subItems.some((subItem) => subItem.href === pathname);
      }
      return false;
    };

    const isSubItemActive = (href: string): boolean => {
      return pathname === href;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col bg-gradient-to-b from-surface to-surface-light border-r border-border h-full w-56 lg:w-56 shadow-xl relative overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(45deg, var(--color-primary) 25%, transparent 25%), linear-gradient(-45deg, var(--color-primary) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--color-primary) 75%), linear-gradient(-45deg, transparent 75%, var(--color-primary) 75%)`,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          />
        </div>

        {/* Share Invite Code */}
        <div className="relative px-6 py-4 border-b border-border-light bg-surface/80 backdrop-blur-sm flex-shrink-0 pb-6 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <ShareIcon className="h-3 w-3 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium text-primary-text">
                  Share Invite
                </span>
                <div className="text-xs text-secondary-text font-mono">
                  GYM2024
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText("GYM2024");
              }}
              className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 text-secondary-text hover:text-primary group"
              title="Copy & share invite code"
            >
              <ClipboardDocumentIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-accent text-secondary-text hover:text-primary-text transition-all duration-200 hover-lift"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Navigation Items - Scrollable */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationConfig.map((item, index) => {
              const isActive = isItemActive(item);
              const isExpanded = expandedItems.has(item.id);
              const Icon = item.icon;

              return (
                <div key={item.id}>
                  {item.expandable ? (
                    <div>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleMainItemClick(item)}
                          className={cn(
                            "flex-1 flex items-center space-x-3 px-4 py-2.5 rounded-l-xl text-left transition-all duration-200 group relative overflow-hidden",
                            isActive
                              ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary-text border border-primary/20 border-r-0 shadow-sm"
                              : "text-secondary-text hover:bg-accent hover:text-primary-text hover:border-border-light border border-transparent border-r-0"
                          )}
                          title={
                            item.subItems && item.subItems.length > 0
                              ? `Go to ${item.subItems[0].title}`
                              : `Go to ${item.title}`
                          }
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-light rounded-r-full"></div>
                          )}

                          <div
                            className={cn(
                              "p-1.5 rounded-lg transition-all duration-200",
                              isActive
                                ? "bg-primary/20 text-primary"
                                : "bg-accent text-secondary-text group-hover:bg-primary/10 group-hover:text-primary"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-xs">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-xs bg-primary text-white rounded-full font-bold shadow-sm">
                              {item.badge}
                            </span>
                          )}
                        </button>

                        {/* Subtle separator */}
                        <div
                          className={cn(
                            "w-px h-6 self-center transition-all duration-200",
                            isActive ? "bg-primary/20" : "bg-border-light"
                          )}
                        />

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(item.id);
                          }}
                          className={cn(
                            "px-2 py-2.5 rounded-r-xl transition-all duration-200 group-expand hover:bg-opacity-80",
                            isActive
                              ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary-text border border-primary/20 border-l-0 shadow-sm hover:bg-primary/15"
                              : "text-secondary-text hover:bg-accent hover:text-primary-text hover:border-border-light border border-transparent border-l-0",
                            "hover:scale-105 active:scale-95"
                          )}
                          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${
                            item.title
                          } menu`}
                          title={`${isExpanded ? "Collapse" : "Expand"} ${
                            item.title
                          } submenu`}
                        >
                          <ChevronDownIcon
                            className={cn(
                              "h-7 w-3 transition-all duration-200",
                              isExpanded ? "rotate-180" : "",
                              "group-expand-hover:scale-110"
                            )}
                          />
                        </button>
                      </div>

                      {/* Sub Items */}
                      {isExpanded && item.subItems && (
                        <div className="ml-6 mt-2 space-y-1.5 pl-4 border-l-2 border-border-light">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={handleNavigation}
                                className={cn(
                                  "block px-3 py-2 rounded-lg text-xs transition-all duration-200 group relative",
                                  isSubItemActive(subItem.href)
                                    ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary-text font-medium border border-primary/20 shadow-sm"
                                    : "text-secondary-text hover:bg-accent hover:text-primary-text font-normal border border-transparent"
                                )}
                              >
                                {/* Active indicator */}
                                {isSubItemActive(subItem.href) && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-light rounded-r-full"></div>
                                )}

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2.5">
                                    <div
                                      className={cn(
                                        "p-1 rounded-md transition-all duration-200",
                                        isSubItemActive(subItem.href)
                                          ? "bg-primary/20 text-primary"
                                          : "bg-accent text-secondary-text group-hover:bg-primary/10 group-hover:text-primary"
                                      )}
                                    >
                                      <SubIcon className="h-3 w-3" />
                                    </div>
                                    <span>{subItem.title}</span>
                                  </div>
                                  {subItem.badge && (
                                    <span className="px-1.5 py-0.5 text-xs bg-primary text-white rounded-full font-bold shadow-sm">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={handleNavigation}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 group relative overflow-hidden",
                        isActive
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary-text border border-primary/20 shadow-sm"
                          : "text-secondary-text hover:bg-accent hover:text-primary-text hover:border-border-light border border-transparent"
                      )}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-light rounded-r-full"></div>
                      )}

                      <div
                        className={cn(
                          "p-1.5 rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-accent text-secondary-text group-hover:bg-primary/10 group-hover:text-primary"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 font-medium text-xs">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-xs bg-primary text-white rounded-full font-bold shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Section - Fixed at bottom */}
          <div className="px-4 py-4 border-t border-border-light bg-surface/80 backdrop-blur-sm flex-shrink-0 space-y-2">
            {/* Separator */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

            <button
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 text-secondary-text hover:bg-accent hover:text-primary-text group"
              )}
            >
              <div className="p-1.5 rounded-lg bg-accent text-secondary-text group-hover:bg-info/10 group-hover:text-info transition-all duration-200">
                <QuestionMarkCircleIcon className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">Support</span>
            </button>

            <button
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 text-secondary-text hover:bg-accent hover:text-primary-text group"
              )}
            >
              <div className="p-1.5 rounded-lg bg-accent text-secondary-text group-hover:bg-warning/10 group-hover:text-warning transition-all duration-200">
                <Cog6ToothIcon className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">Settings</span>
            </button>

            <button
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 text-secondary-text hover:bg-accent hover:text-primary-text group"
              )}
            >
              <div className="p-1.5 rounded-lg bg-accent text-secondary-text group-hover:bg-danger/10 group-hover:text-danger transition-all duration-200">
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">Log out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

Sidebar.displayName = "Sidebar";

export { Sidebar };
