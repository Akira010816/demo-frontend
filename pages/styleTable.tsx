export const stRow = {
  flexWrap: 'nowrap' as const,
}

export const stInputZeroBorder = {
  border: '0px',
  borderRadius: '0px',
  textAlign: 'right' as const,
  marginRight: '12px',
  width: '100%',
  marginTop: '1px',
  minWidth: '30px',
}

export const stSelectZeroBorder = {
  border: '0px',
  borderRadius: '0px',
  width: '100%',
  minWidth: '30px',
}

export const cell = {
  height: '33px',
  fontSize: '14px',
  minWidth: '30px',
}
export const stBLR = {
  ...cell,
  borderBottom: 'solid 1px  #f0f0f0',
  borderLeft: 'solid 1px  #f0f0f0',
  borderRight: 'solid 1px  #f0f0f0',
}

export const stTBL = {
  ...cell,
  borderBottom: 'solid 1px  #f0f0f0',
  borderLeft: 'solid 1px  #f0f0f0',
  borderTop: 'solid 1px  #f0f0f0',
}

export const TBL = {
  height: '33px',
  fontSize: '14px',
  minWidth: '30px',
  borderBottom: 'solid 1px  #dfdfdf',
  borderLeft: 'solid 1px  #dfdfdf',
  borderTop: 'solid 1px  #dfdfdf',
}

export const grayLT = {
  height: '33px',
  fontSize: '14px',
  minWidth: '30px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f4f4f4',
  color: 'gray',
  borderLeft: 'solid 1px  #dfdfdf',
  borderTop: 'solid 1px  #dfdfdf',
}

export const grayLTR = {
  height: '33px',
  fontSize: '14px',
  minWidth: '30px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f4f4f4',
  color: 'gray',
  borderLeft: 'solid 1px  #dfdfdf',
  borderTop: 'solid 1px  #dfdfdf',
  borderRight: 'solid 1px  #dfdfdf',
}

export const grayLT12 = {
  ...grayLT,
  minWidth: '270px',
}

export const grayLT3 = {
  ...grayLT,
  minWidth: '90px',
}

export const headBL = {
  height: '33px',
  fontSize: '14px',
  minWidth: '30px',
  color: 'gray',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f4f4f4',
  borderBottom: 'solid 1px  #dfdfdf',
  borderLeft: 'solid 1px  #dfdfdf',
  paddingBottom: '24px',
}

export const headTBL = {
  height: '33px',
  fontSize: '14px',
  minWidth: '30px',
  color: 'gray',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderTop: 'solid 1px  #dfdfdf',
  borderBottom: 'solid 1px  #dfdfdf',
  borderLeft: 'solid 1px  #dfdfdf',
  backgroundColor: '#f4f4f4',
}

export const headBLRJoin = {
  height: '33px',
  fontSize: '14px',
  minWidth: '30px',
  color: 'gray',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f4f4f4',
  paddingBottom: '24px',
  borderBottom: 'solid 1px  #dfdfdf',
  borderLeft: 'solid 1px  #dfdfdf',
  borderRight: 'solid 1px  #dfdfdf',
}

export const headTBLR = {
  height: '33px',
  fontSize: '14px',
  minWidth: '30px',
  color: 'gray',
  backgroundColor: '#f4f4f4',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderTop: 'solid 1px  #dfdfdf',
  borderBottom: 'solid 1px  #dfdfdf',
  borderLeft: 'solid 1px  #dfdfdf',
  borderRight: 'solid 1px  #dfdfdf',
}

export const footTBLMin = {
  height: '33px',
  fontSize: '14px',
  minWidth: '30px',
  color: 'gray',
  //backgroundColor : '#f4f4f4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  borderTop: 'double 3px  #dfdfdf',
  borderBottom: 'solid 1px  #dfdfdf',
  borderLeft: 'solid 1px  #dfdfdf',
  paddingRight: '8px',
}

export const footTBL = {
  height: '33px',
  fontSize: '14px',
  minWidth: '30px',
  color: 'gray',
  //backgroundColor : '#f4f4f4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  borderTop: 'double 3px  #dfdfdf',
  borderBottom: 'solid 1px  #dfdfdf',
  borderLeft: 'solid 1px  #dfdfdf',
  paddingRight: '11px',
}

export const footTBLR = {
  height: '33px',
  fontSize: '14px',
  minWidth: '30px',
  //backgroundColor : '#f4f4f4',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingRight: '14px',
  color: 'gray',
  borderRight: 'solid 1px  #dfdfdf',
  borderBottom: 'solid 1px  #dfdfdf',
  borderLeft: 'solid 1px  #dfdfdf',
  borderTop: 'double 3px  #dfdfdf',
}

/*これがないとビルド通らない*/
export default function DummyComponent() {
  return <></>
}
