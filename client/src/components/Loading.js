import React, { memo } from 'react'
import {HashLoader} from 'react-spinners'

const Loading = () => {
  return (
    <div>
        <HashLoader color='#f73995'/>
    </div>
  )
}

export default memo(Loading)
