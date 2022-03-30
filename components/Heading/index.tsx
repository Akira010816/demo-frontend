import React, { FC } from 'react'
import { H1 } from './H1'

export type HeadingProps = {
  title: string
}

export type HeadingComponents = {
  H1: FC<HeadingProps>
}

const Heading: FC<HeadingProps> & HeadingComponents = (props) => {
  // <Heading> component defaults to <H1>
  return <H1 {...props} />
}

Heading.H1 = H1

export default Heading
