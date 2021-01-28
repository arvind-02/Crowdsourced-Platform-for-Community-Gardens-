import { Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Navbar = (props) => {
    const [active, setActive] = useState(props.location ? props.location.pathname.slice(1) : "home");
    const HOME = "home";
    const MAP = "map";
    const NEW = "new";
    const pageNames = {};
    pageNames[HOME] = "/";
    pageNames[MAP] = "/map";
    pageNames[NEW] = "/new";

    const handleItemClick = (e, { name }) => setActive(name)

    return (
        <div className = "p-2">
            <Menu borderless className = "Navbar">
                <Menu.Item
                    as = {Link}
                    to = {pageNames[HOME]}
                    name = {HOME}
                    active={active === HOME}
                    onClick={handleItemClick}
                >
                    Home
                </Menu.Item>   
                <Menu.Item
                    as = {Link}
                    to = {pageNames[MAP]}
                    name = {MAP}
                    active={active === MAP}
                    onClick={handleItemClick}
                >
                    Map
                </Menu.Item>    
                <Menu.Item
                    as = {Link}
                    to = {pageNames[NEW]}
                    name = {NEW}
                    active={active === NEW}
                    onClick={handleItemClick}
                >
                    New
                </Menu.Item>               
            </Menu>
        </div>
    );
}

export default Navbar;