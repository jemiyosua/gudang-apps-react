import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useSelector } from 'react-redux'
import { BrowserRouter , Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import LeftMenu from '../../components/molecules/LeftMenu'
import { historyConfig } from '../../utils/functions'
import Dashboard from '../Dashboard'
import MasterProduct from '../Gudang/MasterProduct'
import ImportProduct from '../Gudang/MasterProduct/ImportProduct'
import ScanProduct from '../Gudang/MasterProduct/ScanProduct'
import StokProduct from '../Gudang/StokProduct'
import Category from '../Other/Category'

const MainApp = () => {
    const history = useHistory(historyConfig);

    let match = useRouteMatch();
    const [cookies, setCookie,removeCookie] = useCookies(['user']);

    const [toggled, setToggled] = useState(false);

    const handleToggleSidebar = (value) => {
        setToggled(value);
    };
    const {form}=useSelector(state=>state.PaketReducer);

    useEffect(()=>{
        // alert("mainapp")
        document.title = "Sistem Informasi Akademik Methodist 1";
        // if(cookies.CookieParamKey==null || cookies.CookieParamKey=="" ||
        // cookies.ckUI==null || cookies.ckUI==""){
        //     alert("Session anda telah habis. Silahkan login kembali.");
        //     history.push('/login');
        //     return false;
        // }
     
    },[])
    
    return (
        <div>
            <div className="main-app-wrapper mainapp" style={{display:'flex', backgroundColor:'#F6FBFF', width:'100%'}}> 

                <LeftMenu />

                <div className="content-wrapper" style={{ backgroundColor:'#F6FBFF', height:'100%', padding:30,  width:'100%' }}> 
                    {/* <Header/> */}
                    <BrowserRouter basename="/admin">
                        <Switch>
                            <Route exact path="/dashboard">
                                <Dashboard />
                            </Route>
                            <Route exact path="/gudang/master-product">
                                <MasterProduct />
                            </Route>
                            <Route exact path="/gudang/import-product">
                                <ImportProduct />
                            </Route>
                            <Route exact path="/gudang/scan-product">
                                <ScanProduct />
                            </Route>
                            <Route exact path="/gudang/stok-product">
                                <StokProduct />
                            </Route>
                            <Route exact path="/other/category">
                                <Category />
                            </Route>
                        </Switch>
                    </BrowserRouter>
                </div>
            </div>
        </div>
    )
}

export default MainApp