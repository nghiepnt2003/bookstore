import React from "react"
import { useParams } from "react-router-dom"

const DetailProudct = () => {

    const {id, name} = useParams()
    // console.log(id, name)
    
    return (
        <div>
           DetailProudct
        </div>
    )
}

export default  DetailProudct