type Neutral =
  | 'primary'
  | 'secoundary'
  | 'white'
  | 'lightGrey'
  | 'grey'
  | 'black'
  | 'primaryRed'
  | 'primaryGreenDark'
  | 'blue'
export const neutral: Record<Neutral, string> = {
  primary: '#364e3a',
  primaryRed: '#BF1919',
  secoundary: '#1f9973',
  primaryGreenDark: '#00473a',
  lightGrey: '#f4f4f4',
  white: '#ffffff',
  black: '#292929',
  grey: 'grey',
  blue: '#1d70c9',
}

type Background = 'primary' | 'lightGrey' | 'white'
export const background: Record<Background, string> = {
  white: neutral.white,
  primary: neutral.primary,
  lightGrey: neutral.lightGrey,
}

type Font = 'black' | 'white' | 'grey' | 'red'
export const font: Record<Font, string> = {
  white: neutral.white,
  black: neutral.black,
  grey: neutral.grey,
  red: neutral.primaryRed,
}
