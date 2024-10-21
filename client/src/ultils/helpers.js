import icons from "./icons";

const { FaStar, FaRegStar} = icons

export const createSlug = string => 
    string.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .split(' ')
          .join('-');

export const formatMoney = number =>
    Number(number.toFixed(1)).toLocaleString()

export const renderStarFromNumber = (number) => {

    // if(!Number(number)) return
    // 4 => [1,1,1,1,0]
    // 3 => [1,1,1,0,0]
    const stars = []  
    for(let i=0; i<+number; i++)
        stars.push(<FaStar color="#FFCC66"/>)
    for(let i=5; i>+number; i--)
        stars.push(<FaRegStar color="#FFCC66"/>)
    // if(stars===0)
    //     stars.push(<FaRegStar color="#FFCC66"/>)

    return stars
}

export const formatPrice = number => Math.round(number/1000)*1000