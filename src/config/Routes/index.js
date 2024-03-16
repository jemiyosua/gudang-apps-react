import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from '../../pages/Login';
import MainApp from '../../pages/MainApp';
// import MainApp from '../../admin/pages/MainApp';

const Routes = () => {
    return (
		<Router >
			<Switch>
				<Route path='/admin/Login'>
					<Login/>
				</Route>
				<Route path='/admin/dashboard'>
					<MainApp/>
				</Route>
				<Route path='/admin/master-data'>
					<MainApp/>
				</Route>
				<Route path='/admin/main'>
					<MainApp/>
				</Route>
				<Route path='/admin/student'>
					<MainApp/>
				</Route>
				<Route path='/admin/user'>
					<MainApp/>
				</Route>
				<Route path='/admin/input-admin-access'>
					<MainApp/>
				</Route>
				<Route path='/admin/update-admin-access'>
					<MainApp/>
				</Route>
				<Route path='/admin/input-role-access'>
					<MainApp/>
				</Route>
				<Route path='/admin/update-role-access'>
					<MainApp/>
				</Route>
				{/* <Route path='/:post'>
					<Post/>
				</Route> */}
				<Route path='/'>
					<Login/>
				</Route>
			</Switch>
		</Router>
    )
}

export default Routes;
