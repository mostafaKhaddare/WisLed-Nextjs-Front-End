import React from 'react'
import { ChevronRightIcon } from '@modules/common/icons/chevron-right'
import Link from 'next/link';

export default function CategoryBreadcrumbs({
  countryCode,
  categoryTrail,
}: {
  countryCode: string
  categoryTrail: Array<{ name: string; handle: string }>
}) {
  return (
    <nav className="mb-1 w-full p-2" aria-label="Breadcrumb">
 
        <div className="max-w-full overflow-x-auto scrollbar-hide">
          <ol role="list" className="flex items-center  text-sm ">
            {/* Home / root */}
            <li className="flex items-center flex-shrink-0">
              <Link
                href={`/${countryCode}/categories`}
                className="flex items-center gap-2  text-gray-700 px-2 py-1 "
              >
                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" />
                </svg>
                <span className="text-xs font-medium">Categories</span>
              </Link>
            </li>

            {categoryTrail.map((cat, idx) => {
              const isCurrent = idx === categoryTrail.length - 1
              const href = `/${countryCode}/categories/${cat.handle}`

              return (
                <li key={cat.handle} className="flex items-center flex-shrink-0">
                  <ChevronRightIcon className="h-4 w-4 text-gray-300 flex-shrink-0 mx-1" />

                  {/* parent/path pills */}
                  {isCurrent ? (
                    <span className=" text-action-primary px-3 py-1 rounded-full text-xs font-semibold truncate max-w-[220px] ml-1" aria-current="page">
                      {cat.name}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className=" text-action-primary px-3  text-xs font-medium truncate ml-1 "
                    >
                      {cat.name}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      
    </nav>
  )
}
