import { IconProps } from 'types/icon'

// TODO: Replace icon with the open source one

export const EditIcon = (props: IconProps) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.8333 3.33333L16.6667 9.16667M13.3333 19.1667H19.1667M3.33333 19.1667L9.44444 19.1667L18.3333 10.2778C18.7753 9.83582 19.0236 9.23637 19.0236 8.61111C19.0236 7.98585 18.7753 7.3864 18.3333 6.94444L13.0556 1.66667C12.6136 1.22467 12.0142 0.976366 11.3889 0.976366C10.7636 0.976366 10.1642 1.22467 9.72222 1.66667L3.33333 8.05556V14.1667L3.33333 19.1667Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
