import {
  BoxIcon,
  DashboardIcon,
  LogoutIcon,
  SettingsIcon,
  ShippingIcon,
} from '@modules/common/icons'

export const profileNavItemsGroups = [
  [
    {
      href: '/account',
      icon: <DashboardIcon className="h-6 w-6" />,
      label: 'Tableau de bord',
      type: 'link',
    },
    {
      href: '/account/orders',
      icon: <BoxIcon className="h-6 w-6" />,
      label: 'Historique de commandes',
      type: 'link',
    },
  ],
  [
    {
      href: '/account/addresses',
      icon: <ShippingIcon className="h-6 w-6" />,
      label: 'Adresses de livraison',
      type: 'link',
    },
    {
      href: '/account/profile',
      icon: <SettingsIcon className="h-6 w-6" />,
      label: 'Paramètres du compte',
      type: 'link',
    },
  ],
  [
    {
      href: '',
      type: 'logout',
      icon: <LogoutIcon className="h-6 w-6" />,
      label: 'Déconnexion',
    },
  ],
]
