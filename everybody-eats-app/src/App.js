import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Router from './components/router/Router';
import 'semantic-ui-css/semantic.min.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/" render={(props) => <Navbar {...props}/>}/>
        </Switch>
        <Router/>
      </BrowserRouter>
    </div>
  );
}

export default App;