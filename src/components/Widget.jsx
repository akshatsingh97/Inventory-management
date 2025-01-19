import React from 'react'

const Widget = ({ title, count}) => {

  return (
    <div className='widget'>
        <h3>{title}</h3>
        <h1>{count}</h1>
    </div>
  )
}

export default Widget