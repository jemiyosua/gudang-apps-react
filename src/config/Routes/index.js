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
				<Route path='/admin/gudang/master-product'>
					<MainApp/>
				</Route>
				<Route path='/admin/gudang/import-product'>
					<MainApp/>
				</Route>
				<Route path='/admin/gudang/scan-product'>
					<MainApp/>
				</Route>
				<Route path='/admin/gudang/stok-product'>
					<MainApp/>
				</Route>
				<Route path='/admin/other/category'>
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
