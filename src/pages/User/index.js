import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap } from '../../components';
import './Tab.css'
import { useDispatch } from 'react-redux';
import { historyConfig, generateSignature, fetchStatus } from '../../utils/functions';
import { setForm } from '../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import AdminAccess from './AdminAccess'
import RoleAccess from './RoleAccess'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPerson } from '@fortawesome/free-solid-svg-icons';

const User = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

    const [StateTabsAdminAccess, setStateTabsAdminAccess] = useState(true)
    const [StateTabsRoleAccess, setStateTabsRoleAccess] = useState(false)

	useEffect(() => {
        window.scrollTo(0, 0)

        var HistoryPage = cookies.varHistoryPage

        if (HistoryPage === "role") {
            setStateTabsAdminAccess(false)
            setStateTabsRoleAccess(true)
        }

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        
        if (CookieParamKey == null || CookieParamKey === "" || CookieUsername == null || CookieUsername === "") {
            logout()
            window.location.href="admin/login";
            return false;
        } else {
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","User"))
        }

        setCookie('varHistoryPage', '')

    },[])

    const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie == "string") {
            var LongSecretCookie = SecretCookie.split("|");
            var UserName = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var Nama = LongSecretCookie[2];
            var Role = LongSecretCookie[3];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)
        
            if (tipe === "username") {
                return UserName;            
            } else if (tipe === "paramkey") {
                return ParamKey;
            } else if (tipe === "nama") {
                return Nama;
            } else if (tipe === "role") {
                return Role;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

	const logout = () => {
        removeCookie('varCookie', { path: '/'})
        removeCookie('varMerchantId', { path: '/'})
        removeCookie('varIdVoucher', { path: '/'})
        dispatch(setForm("ParamKey",''))
        dispatch(setForm("Username",''))
        dispatch(setForm("Name",''))
        dispatch(setForm("Role",''))
        if(window){
            sessionStorage.clear();
		}
    }
    
    return (
		<div className="main-page" style={{ backgroundColor:'#F6FBFF' }}>
           
            <div className="content-wrapper-2" style={{ backgroundColor:'#F6FBFF', width:'100%' }} >
                <div className="blog-post">
                    <div style={{ fontWeight:'bold', color:'#004372', fontSize:30 }}><FontAwesomeIcon icon={faPerson}/> User</div>
                    <p style={{ margin:0 }}>Here's for all Admin from SIAM platform.</p>

                    {/* ALERT */}
                    {SessionMessage !== "" ?
                    <SweetAlert 
                        warning 
                        show={ShowAlert}
                        onConfirm={() => {
                            logout()
                            setShowAlert(false)
                            window.location.href="admin/login";
                        }}
                        btnSize="sm">
                        {SessionMessage}
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

                    {StateTabsAdminAccess ?
                    <div>
                        <div style={{ display:'flex' }}>
                            <div>
                                <button role="tab" aria-controls="merchant-list">
                                    <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Admin Access</div>
                                </button>
                                <section id="merchant-list"></section>
                            </div>
                            <div style={{ color:'#004372', paddingLeft:30, fontSize:16, cursor:'pointer', fontWeight:'bold' }} onClick={() => {
                                setStateTabsAdminAccess(false)
                                setStateTabsRoleAccess(true)
                            }}>Role Access</div>
                        </div>
                    </div>
                    :
                    <div style={{ display:'flex' }}>
                        <div style={{ color:'#004372', paddingRight:30, paddingLeft:30, fontSize:16, cursor:'pointer', fontWeight:'bold' }} onClick={() => {
                        setStateTabsAdminAccess(true)
                        setStateTabsRoleAccess(false)
                        }}>Admin Access</div>
                        <div>
                            <button role2="tab2" aria-controls="merchant-list">
                                <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Role Access</div>
                            </button>
                            <section id="merchant-list"></section>
                        </div>
                    </div>
                    }

                    {StateTabsAdminAccess ?
                    <AdminAccess />
                    :
                    <RoleAccess />
                    }

                    <Gap height={10} />

                </div>
            </div>

        </div>
    )
}

export default User;