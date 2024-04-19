import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Gap } from '../../components'
import "../../App.css"
import { useSelector,useDispatch } from 'react-redux';
import { setForm } from '../../redux';
import { AlertMessage, paths } from '../../utils'
import { useCookies } from 'react-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import Transaksi from './Transaksi'
// import ScanProduct from './ScanProduct'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister, faLayerGroup, faWarehouse } from '@fortawesome/free-solid-svg-icons';

const Gudang = () => {
    const history = useHistory();
    const [OrderBy,setOrderBy] = useState("")
    const [Order,setOrder] = useState("DESC")

    const location = useLocation();
    // location.state.postContent
    const dispatch = useDispatch();
    const [cookies, setCookie,removeCookie] = useCookies(['user']);
    const [PageActive,setPageActive] = useState(1)

    const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

    const [TabActive, setTabActive] = useState("")

    const [TabTransaksi, setTabTransaksi] = useState(true)
    const [TabScanProduk, setTabScanProduk] = useState(false)

    useEffect(()=>{
        if (location.state == null) {
            setSuccessMessage("");
            setTabActive("master-product")
        } else {

            if (location.state.Tab !== "") {
                setTabActive(location.state.Tab)
            } else {
                setTabActive("master-product")
            }

            if (location.state.MessageSukses !== "") {
                setSuccessMessage(location.state.MessageSukses);
                setShowAlert(true);
            }
        }

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        
        if (CookieParamKey === null || CookieParamKey === "" || CookieUsername === null || CookieUsername === ""){
            window.location.href="admin/login";
        }else{
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","GUDANG"))
        }

    },[])
    
    const logout = ()=>{
        removeCookie('varCookie', { path: '/'});
        removeCookie('CookieProductName', { path: '/'});
        removeCookie('CookieSourceCode', { path: '/'});
        dispatch(setForm("ParamKey",''))
        dispatch(setForm("UserID",''))
        if(window){
            sessionStorage.clear();
        }
        window.location.href="admin/login";
    }

    const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        if (SecretCookie !== "" && SecretCookie !== null) {
            var LongSecretCookie = SecretCookie.split("|");
            var Username = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)
        
            if (tipe === "username") {
                return Username;            
            } else if (tipe === "paramkey") {
                return ParamKey;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    return (
        <div className="main-page" style={{backgroundColor:'#F6FBFF'}}>
           
            <div className="content-wrapper-2" style={{backgroundColor:'#F6FBFF'}} >
                <div className="blog-post">
                    <div style={{ fontWeight:'bold', color:'#004372', fontSize:30 }}><FontAwesomeIcon icon={faCashRegister}/> Kasir</div>

                    {/* ALERT */}
                    {SessionMessage !== "" ?
                    <SweetAlert 
                        warning 
                        show={ShowAlert}
                        onConfirm={() => {
                            setShowAlert(false)
                            logout()
                            window.location.href="admin/login";
                        }}
                        btnSize="sm">
                        {SessionMessage}
                    </SweetAlert>
                    :""}

                    {SuccessMessage !== "" ?
                    <SweetAlert 
                        success 
                        show={ShowAlert}
                        onConfirm={() => {
                            setShowAlert(false)
                            setSuccessMessage("")
                        }}
                        btnSize="sm">
                        {SuccessMessage}
                    </SweetAlert>
                    :""}          

                    {ErrorMessageAlert !== "" ?
                    <SweetAlert 
                        danger 
                        show={ShowAlert}
                        onConfirm={() => {
                            setShowAlert(false)
                            setErrorMessageAlert("")
                        }}
                        btnSize="sm">
                        {ErrorMessageAlert}
                    </SweetAlert>
                    :""}

                    {ErrorMessageAlertLogout !== "" ?
                    <SweetAlert 
                        danger 
                        show={ShowAlert}
                        onConfirm={() => {
                            setShowAlert(false)
                            setErrorMessageAlertLogout("")
                            window.location.href="admin/login";
                        }}
                        btnSize="sm">
                        {ErrorMessageAlertLogout}
                    </SweetAlert>
                    :""}
                    {/* END OF ALERT */}
                    <Gap height={20} />

                    {TabTransaksi ?
                    <div style={{ display:'flex' }}>
                        <div>
                            <button role="tab" aria-controls="merchant-list">
                                <div style={{ color:'#61308C', fontSize:16 }}>Transaksi</div>
                            </button>
                        </div>
                        <div style={{ color:'#546E7A', paddingLeft:30, paddingRight:30, fontSize:16, cursor:'pointer', paddingTop:4 }} onClick={() => {
                            setTabTransaksi(false)
                            setTabScanProduk(true)
                        }}>Scan Product</div>
                    </div>
                    : TabScanProduk ?
                    <div style={{ display:'flex' }}>
                        <div style={{ color:'#546E7A', paddingLeft:30, paddingRight:30, fontSize:16, cursor:'pointer', paddingTop:4 }} onClick={() => {
                            setTabTransaksi(true)
                            setTabScanProduk(false)
                        }}>Transaksi</div>
                        <div>
                            <button role="tab" aria-controls="merchant-list">
                                <div style={{ color:'#61308C', fontSize:16 }}>Scan Product</div>
                            </button>
                        </div>
                    </div>
                    :
                    null
                    }
                    
                    {TabTransaksi ?
                    <Transaksi />
                    :TabScanProduk ?
                    null
                    // <ScanProduct />
                    :
                    null
                    }

                    <Gap height={10} />

                </div>
            </div>

        </div>
    )
}


export default Gudang

