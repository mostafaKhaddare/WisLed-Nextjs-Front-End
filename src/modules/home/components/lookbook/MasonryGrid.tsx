'use client'

import React from 'react'
import Masonry from 'react-masonry-css'

const MasonryGrid = ({ children }: { children: React.ReactNode }) => {
    const breakpointColumnsObj = {
        default: 3,
        1024: 2,
        640: 1
    }

    return (
        <>
            <style jsx global>{`
                .my-masonry-grid {
                    display: -webkit-box; /* Not needed if flex works */
                    display: -ms-flexbox; /* Not needed */
                    display: flex;
                    margin-left: -24px; /* gutter size offset */
                    width: auto;
                }
                .my-masonry-grid_column {
                    padding-left: 24px; /* gutter size */
                    background-clip: padding-box;
                }
            `}</style>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                {children}
            </Masonry>
        </>
    )
}

export default MasonryGrid
