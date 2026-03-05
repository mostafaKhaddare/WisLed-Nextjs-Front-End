import { Button } from '@modules/common/components/button'
import { MoonIcon, SunIcon } from '@modules/common/icons'
import { useTheme } from 'next-themes'

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <Button
      variant="text"
      onClick={() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
      }}
      className="w-full justify-start rounded-none p-0 hover:bg-hover dark:hover:bg-white/5"
    >
      <div className="flex items-center gap-4 p-4 text-lg">
        {resolvedTheme === 'dark' ? (
          <>
            <SunIcon /> Mode clair
          </>
        ) : (
          <>
            <MoonIcon /> Mode sombre
          </>
        )}
      </div>
    </Button>
  )
}
