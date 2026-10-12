import React from 'react'

import Footer from '@modules/layout/templates/footer'
import NavWrapper from '@modules/layout/templates/nav'
import Reassurance from '@modules/common/components/reassurance'

const Layout: React.FC<{
  params: { countryCode: string }
  children: React.ReactNode
}> = ({ params, children }) => {
  return (
    <div>
      <NavWrapper countryCode={params.countryCode} />
      <main className="relative">{children}</main>
      <Reassurance />
      <Footer countryCode={params.countryCode} />
    </div>
  )
}

export default Layout
