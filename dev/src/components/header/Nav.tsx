import * as React from 'react'
import {Link,NavLink} from 'react-router-dom'
import { Route } from 'react-router-dom'
import Login from '../login'
import { PAGE_NAME } from '../../resource/message'

const Navbar = ({ staticUrl,suburl,allowLoginType,auth,logout,curretPage }) =>{
    suburl = staticUrl != "" ?`${staticUrl}/${suburl}`:suburl

    const handle_logout = (event) =>{
        logout()
        event.preventDefault()
    }

    return(
        <div className="nav">
            <ul className="tabs tabs-transparent " >
                <li className={curretPage == PAGE_NAME.LIST_PAGE? "tab active" :"tab"}>
                    <Route render={({ history}) => (
                    <Link to={`/${suburl}`}  onClick={() => { history.push(`/${suburl}`) }}>HOME</Link>
                    )} />
                </li>
                <li className={curretPage == PAGE_NAME.ABOUT_PAGE? "tab active" :"tab"}>
                    <Route render={({ history}) => (
                        <NavLink to={`/${suburl}/about`}  onClick={() => { history.push(`/${suburl}/about`) }}>ABOUT</NavLink>
                    )} />
                </li>
                <li className={!auth ?"tab auth show":"tab auth hidden"}>
                   <Login allowLoginType={allowLoginType} />
                </li>
                <li className={auth?"tab auth show":"tab auth hidden"}>
                    <Route render={({ history}) => (
                        <NavLink to={`/${suburl}/logout`}  onClick={handle_logout}>LOGOUT</NavLink>
                    )} />
                </li>
            </ul>
        </div>
    )
}

export default Navbar