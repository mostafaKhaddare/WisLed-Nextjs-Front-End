'use client'

import React from 'react'

import { cn } from '@lib/util/cn'

const TAB_BASE = `
  relative inline-flex h-11 shrink-0 items-center justify-center
  whitespace-nowrap rounded-full border px-5 font-jakarta text-sm font-semibold
  leading-none transition-all duration-200 ease-out
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]
  focus-visible:ring-offset-2 focus-visible:ring-offset-white
  dark:focus-visible:ring-offset-[#0F1B33]
`

const TAB_ACTIVE = `
  border-[#0F1B33] bg-[#0F1B33] text-white
  shadow-[0_4px_12px_rgba(15,27,51,0.22)]
  hover:bg-[#1a2b4d] hover:border-[#1a2b4d]
  dark:border-white dark:bg-white dark:text-[#0F1B33]
  dark:hover:bg-gray-100
`

const TAB_INACTIVE = `
  border-[#D5DAE6] bg-white text-[#5B6577]
  hover:border-[#0F1B33]/35 hover:bg-[#F6F7FB] hover:text-[#0F1B33]
  dark:border-white/15 dark:bg-white/5 dark:text-gray-300
  dark:hover:border-white/30 dark:hover:bg-white/10 dark:hover:text-white
`

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
        <div
            role="tablist"
            aria-label="Filtrer les inspirations"
            className="no-scrollbar -mx-1 flex w-full items-center gap-2 overflow-x-auto px-1 py-1"
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab
                return (
                    <button
                        key={tab}
                        role="tab"
                        type="button"
                        aria-selected={isActive}
                        onClick={() => onTabClick(tab)}
                        className={cn(
                            TAB_BASE,
                            isActive ? TAB_ACTIVE : TAB_INACTIVE
                        )}
                    >
                        {tab}
                    </button>
                )
            })}
        </div>
    )
}

export default LookbookTabs
