import { style } from 'typestyle'

export const grayButton = {
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  color: '#000',
}

export const inactiveChart = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '2px dashed lightgray',
  padding: '1rem',
  borderRadius: '12px',
}

//className={commonButton}で使用すること
export const commonButton = style({
  backgroundColor: 'rgb(0,71,58)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgb(50,141,108)',
      color: '#fff',
    },
  },
})

export const subButton = style({
  backgroundColor: 'rgb(102,145,137)',
  color: '#fff',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgb(152,195,187)',
      color: '#fff',
    },
  },
})

export const nextButton = style({
  backgroundColor: 'rgb(0,71,58)',
  borderRadius: '20px',
  width: 'auto',
  marginTop: '10px',
  color: '#fff',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgb(152,195,187)',
      color: '#fff',
    },
  },
})

export const removeButton = style({
  backgroundColor: 'rgb(204,71,71)',
  color: '#fff',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgb(217,117,117)',
      color: '#fff',
    },
  },
})

export const title = {
  color: 'black',
  padding: '8px',
  marginTop: '20px',
  marginBottom: '20px',
  width: '100%',
  borderLeft: 'solid 15px rgb(0,71,58)',
  borderBottom: 'solid 3px rgb(0,71,58)',
  fontSize: 'large',
  fontWeight: 500,
}

export const subTitle = {
  color: 'black',
  padding: '8px',
  paddingLeft: '16px',
  marginTop: '16px',
  marginRight: '32px',
  width: '100%',
  backgroundColor: '#fcfcfc',
  border: '1px solid #dfdfdf',
}

export const showArea = {
  display: 'block',
}

export const hideArea = {
  display: 'none',
}

//className={commonButton}で使用すること
export const menuItem = style({
  //backgroundColor: 'rgb(0,71,58)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgb(204,218,216)',
      color: 'rgb(0,71,58)',
    },
  },
})

/*
#remove_button{
  background-color: rgb(204,71,71);
  color: #fff
}

#remove_button:hover {
  background-color: rgb(217,117,117);
  color: #fff
}
  */

export default function DummyComponent() {
  return <></>
}

export const login_title = {
  color: 'black',
  padding: '8px',
  marginTop: '20px',
  marginBottom: '20px',
  width: '100%',
  borderLeft: 'solid 15px rgb(26, 119, 212)',
  borderBottom: 'solid 3px rgb(26, 119, 212)',
  fontSize: 'large',
  fontWeight: 500,
}
