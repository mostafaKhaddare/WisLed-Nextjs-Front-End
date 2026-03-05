'use client'

import React from 'react'

const LookbookTabs = ({
    tabs,
    activeTab,
    onTabClick,
}: {
    tabs: string[]
    activeTab: string
    onTabClick: (tab: string) => void
}) => {
    return (
        <div className="relative flex gap-1.5 overflow-x-auto items-center bg-gray-100 dark:bg-white/[0.06] p-1.5 rounded-full border border-gray-200/80 dark:border-white/[0.06] max-w-full shadow-inner">
            {tabs.map((tab) => {
                const isActive = activeTab === tab
                return (
                    <button
                        key={tab}
                        onClick={() => onTabClick(tab)}
                        className={`
              relative px-5 py-2 rounded-full whitespace-nowrap font-medium text-sm
              transition-all duration-300 ease-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${isActive
                                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-md scale-[1.03]'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/[0.08] scale-100'
                            }
            `}
                        style={{
                            // Smooth pill background crossfade via box-shadow for active state
                            boxShadow: isActive
                                ? '0 2px 8px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)'
                                : 'none',
                        }}
                    >
                        {/* Subtle dot indicator for active tab */}
                        {isActive && (
                            <span
                                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"
                                style={{ animation: 'tab-dot-in 0.25s ease-out forwards' }}
                            />
                        )}
                        <span className={`transition-transform duration-300 ${isActive ? 'translate-y-[-1px]' : 'translate-y-0'}`}>
                            {tab}
                        </span>
                    </button>
                )
            })}

            <style>{`
        @keyframes tab-dot-in {
          from { opacity: 0; transform: translateX(-50%) scale(0); }
          to   { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}</style>
        </div>
    )
}

export default LookbookTabs
