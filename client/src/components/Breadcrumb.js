import React from 'react'
import { Link } from 'react-router-dom';
import useBreadcurmbs from "use-react-router-breadcrumbs";
import icons from "../ultils/icons"

const Breadcrumb = ({name}) => {
  const {IoIosArrowForward} = icons
  const routes = [
    {path: "/", breadcrumb: "Home"},
    {path:":id/:name", breadcrumb: name}
  ];
  const breadcrumb = useBreadcurmbs(routes)
  // console.log(breadcrumb)
  return (
    <div className='text-sm flex items-center gap-1 ml-4'>
       {breadcrumb?.filter(el => !el.match.route==false).map(({match, breadcrumb}, index, self) => (
        <Link className='flex items-center gap-1 hover:text-main' key={match.pathname} to={match.pathname}>
         <span> {breadcrumb}</span>
         {index !== self.length-1 && <IoIosArrowForward />}
        </Link>
       ))}
    </div>
  )
}

export default Breadcrumb
