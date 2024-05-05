import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap } from '../../../components';
import './Tab.css'
import { useDispatch } from 'react-redux';
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import DaftarSiswa from './DaftarSiswa'
import MataPelajaran from './MataPelajaran'
import Jurusan from './Jurusan'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCodeBranch, faPerson } from '@fortawesome/free-solid-svg-icons';

const MasterDataMain = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

    const [AnchorMasterData, setAnchorMasterData] = useState("")
    const [IconPage, setIconPage] = useState("")
    const [TabKelas, setTabKelas] = useState("10")

	useEffect(() => {
        window.scrollTo(0, 0)

        var AnchorMasterData = cookies.anchorMasterData;
        setAnchorMasterData(AnchorMasterData)

        var Icon = ""
        if (AnchorMasterData === "Jurusan") {
            Icon = <FontAwesomeIcon icon={faCodeBranch} />
        } else if (AnchorMasterData === "Mata Pelajaran") {
            Icon = <FontAwesomeIcon icon={faBook} />
        }
        setIconPage(Icon)

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        
        if (CookieParamKey == null || CookieParamKey === "" || CookieUsername == null || CookieUsername === "") {
            logout()
            window.location.href="admin/login";
            return false;
        } else {
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            // dispatch(setForm("PageActive","User"))
        }

        setCookie('anchorMasterData', '')

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
		<div >
           
            <div className="content-wrapper-2" style={{ backgroundColor:'#F6FBFF', width:'100%' }} >
                <div className="blog-post">
                    <div style={{ fontWeight:'bold', color:'#004372', fontSize:30 }}>{IconPage} {AnchorMasterData}</div>

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

                    {AnchorMasterData === "Daftar Siswa" ?
                    <div></div>
                    :AnchorMasterData === "Daftar Guru" ?
                    <div></div>
                    :AnchorMasterData === "Mata Pelajaran" ?
                        <div>
                            <div style={{ display:'flex' }}>
                                <div>
                                    <button role="tab" aria-controls="merchant-list">
                                        <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Daftar Mata Pelajaran</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        // TabKelas === "10" ?
                        // <div>
                        //     <div style={{ display:'flex' }}>
                        //         <div>
                        //             <button role="tab" aria-controls="merchant-list">
                        //                 <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Kelas 10</div>
                        //             </button>
                        //         </div>
                        //         <div style={{ color:'#004372', paddingLeft:30, fontSize:16, cursor:'pointer', fontWeight:'bold' }} onClick={() => setTabKelas("11")}>Kelas 11</div>
                        //         <div style={{ color:'#004372', paddingLeft:30, fontSize:16, cursor:'pointer', fontWeight:'bold' }} onClick={() => setTabKelas("12")}>Kelas 12</div>
                        //     </div>
                        // </div>
                        // :TabKelas === "11" ?
                        // <div style={{ display:'flex' }}>
                        //     <div style={{ color:'#004372', paddingRight:30, paddingLeft:30, fontSize:16, cursor:'pointer', fontWeight:'bold' }} onClick={() => setTabKelas("10")}>Kelas 10</div>
                        //     <div>
                        //         <button role2="tab2" aria-controls="merchant-list">
                        //             <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}></div>
                        //         </button>
                        //         <section id="merchant-list"></section>
                        //     </div>
                        // </div>
                        // :TabKelas === "12" ?
                        // <div>
                        //     <div style={{ display:'flex' }}>
                        //         <div>
                        //             <button role="tab" aria-controls="merchant-list">
                        //                 <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Kelas 10</div>
                        //             </button>
                        //         </div>
                        //         <div style={{ color:'#004372', paddingLeft:30, fontSize:16, cursor:'pointer', fontWeight:'bold' }} onClick={() => setTabKelas()}>Kelas 11</div>
                        //     </div>
                        // </div>
                        // :
                        // <div></div>
                    :AnchorMasterData === "Jurusan"? 
                    <div>
                        <div style={{ display:'flex' }}>
                            <div>
                                <button role="tab" aria-controls="merchant-list">
                                    <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Daftar Jurusan</div>
                                </button>
                            </div>
                        </div>
                    </div>
                    :
                    <div></div>
                    }

                    {AnchorMasterData === "Daftar Siswa" ?
                    <></>
                    :AnchorMasterData === "Daftar Guru" ?
                    <></>
                    :AnchorMasterData === "Mata Pelajaran" ?
                    <MataPelajaran/>
                    : AnchorMasterData === "Jurusan" ?
                    <Jurusan/>
                    :
                    <></>
                    }

                    <Gap height={10} />

                </div>
            </div>

        </div>
    )
}

export default MasterDataMain;