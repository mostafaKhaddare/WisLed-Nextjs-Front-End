'use client'

import React, { Fragment } from 'react'
import { useParams } from 'next/navigation'

import { Popover, Transition } from '@headlessui/react'
import { signout } from '@lib/data/customer'
import AccountNavLink from '@modules/account/components/account-nav/account-nav-link'
import { profileNavItemsGroups } from '@modules/account/components/account-nav/consts'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import Divider from '@modules/common/components/divider'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { HeadphonesIcon, LogoutIcon, UserIcon } from '@modules/common/icons'

import { ThemeSwitcher } from './theme-switcher'

const ProfileDropdown = ({ loggedIn }: { loggedIn: boolean }) => {
  const { countryCode } = useParams()

  const handleLogout = async () => {
    await signout(countryCode as string)
  }

  return (
    <Box className="z-50 h-full">
      <Popover className="relative h-full">
        <Popover.Button
          className="cursor-default rounded-full bg-transparent !p-2 text-black outline-none hover:text-action-primary-hover active:bg-fg-secondary-pressed active:text-action-primary-pressed xsmall:!p-3.5 small:hover:bg-fg-secondary-hover dark:text-white dark:hover:bg-white/20 dark:hover:text-white dark:active:bg-white/15 dark:active:text-white"
          data-testid="profile-dropdown-button"
        >
          <UserIcon />
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel
            className="absolute -right-10 top-[calc(100%+8px)] z-50 w-[264px] rounded-xl border border-basic-primary/10 bg-primary text-basic-primary shadow-2xl small:right-0 dark:border-white/[0.06] dark:bg-[#14161b] dark:text-slate-100"
            data-testid={`${loggedIn ? 'profile-dropdown-logged-in' : 'profile-dropdown-logged-out'}`}
          >
            {loggedIn ? (
              profileNavItemsGroups.slice(0, 2).map((group, groupIndex) => (
                <Fragment key={groupIndex}>
                  <ul className="p-2">
                    {group.map((item) => (
                      <li key={item.href || item.type}>
                        {item.type === 'logout' ? (
                          <Button
                            variant="text"
                            onClick={handleLogout}
                            className="w-full justify-start rounded-none p-0 hover:bg-hover dark:hover:bg-white/5"
                          >
                            <div className="flex items-center gap-2 p-4 text-lg">
                              {item.icon}
                              {item.label}
                            </div>
                          </Button>
                        ) : (
                          <AccountNavLink href={item.href} icon={item.icon}>
                            {item.label}
                          </AccountNavLink>
                        )}
                      </li>
                    ))}
                  </ul>
                  {groupIndex < profileNavItemsGroups.length - 1 && (
                    <div className="h-px w-full bg-hover dark:bg-white/10" />
                  )}
                </Fragment>
              ))
            ) : (
              <>
                <Box
                  className="flex flex-col gap-2 p-2"
                  data-testid="profile-dropdown-sign-in-up"
                >
                  <Button size="sm" asChild>
                    <LocalizedClientLink href="/account?mode=sign-in">
                      Se connecter
                    </LocalizedClientLink>
                  </Button>
                  <Button size="sm" asChild variant="tonal">
                    <LocalizedClientLink href="/account?mode=register">
                      Créer un compte
                    </LocalizedClientLink>
                  </Button>
                </Box>
                <Divider />
              </>
            )}
            <Box className="p-2">
              <ThemeSwitcher />
              <AccountNavLink href="#" icon={<HeadphonesIcon />}>
                Centre d&apos;aide
              </AccountNavLink>
            </Box>
            {loggedIn && (
              <>
                <Divider />
                <Box className="p-2">
                  <Button
                    variant="text"
                    onClick={handleLogout}
                    className="w-full justify-start rounded-none p-0 hover:bg-hover dark:hover:bg-white/5"
                  >
                    <div className="flex items-center gap-4 p-4 text-lg">
                      <LogoutIcon />
                      Déconnexion
                    </div>
                  </Button>
                </Box>
              </>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
    </Box>
  )
}

export default ProfileDropdown
