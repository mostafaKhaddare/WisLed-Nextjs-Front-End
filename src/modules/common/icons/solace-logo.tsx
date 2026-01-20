import { IconProps } from 'types/icon'
import { Orbitron } from 'next/font/google'

// 1. Configure the "Lighting" style font
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700'], // Bold is best for logos
  display: 'swap',
})

export const WisLedLogo = (props: IconProps) => {
  return (
    <svg
      width="122"
      height="28"
      viewBox="0 0 122 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Wisled Logo</title>
      {/* 2. Applied the font class here.
         I increased letterSpacing to 0.1em because wide spacing 
         looks more premium and "architectural" for lighting brands.
      */}
      <text
        x="50%"
        y="58%" // Slight vertical adjustment for this specific font
        dominantBaseline="middle"
        textAnchor="middle"
        fill="currentColor"
        fontSize="22"
        className={orbitron.className}
        letterSpacing="0.1em"
      >
        <tspan>WIS</tspan>
        <tspan className="fill-brand-500">LED</tspan>
      </text>
    </svg>
  )
}