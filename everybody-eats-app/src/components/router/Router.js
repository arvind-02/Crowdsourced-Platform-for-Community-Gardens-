import { Switch, Route, Redirect } from 'react-router-dom';
import Home from '../home/Home';
import Map from '../map/Map';
import New from '../new/New';

const Router = () => {
    return (
        <Switch>
            <Route exact path = "/" render = {(props) => <Home {...props}/>}/>
            <Route exact path = "/map" render = {(props) => <Map {...props}/>}/>
            <Route exact path = "/new" render = {(props) => <New {...props}/>}/>
            <Route path = "/">
                <Redirect to ="/"/>
            </Route>
        </Switch>
    );
}

export default Router;