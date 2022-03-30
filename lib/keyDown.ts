import { KeyboardEvent } from 'react'

export const skipEnter = (event: KeyboardEvent<HTMLInputElement>) => {
  event.keyCode == 13 ? event.preventDefault() : ''
}
