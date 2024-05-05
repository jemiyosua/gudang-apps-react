import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap } from '../../components';
import { useDispatch } from 'react-redux';
import { historyConfig, generateSignature, fetchStatus } from '../../utils/functions';
import { setForm } from '../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
// import AdminAccess from './AdminAccess'
// import RoleAccess from './RoleAccess'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBasketball, faBook, faChevronRight, faCodeBranch, faGear, faGraduationCap, faHandsHolding, faPeopleGroup, faPersonChalkboard, faPersonCircleCheck, faServer } from '@fortawesome/free-solid-svg-icons';
import { Col, Row } from 'react-bootstrap';
import { AlertMessage, paths } from '../../utils'

const User = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	
    const [Loading, setLoading] = useState(false)
    const [ListSubMenu, setListSubMenu] = useState([])
    const [IdIndex, setIdIndex] = useState("")
    const [isHovering, setIsHovering] = useState(false)
    const [isHoveringNoEdit, setIsHoveringNoEdit] = useState(false)

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
            dispatch(setForm("PageActive","Master Data"))

            getSubMenu()
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

    const getSubMenu = (Page, Position) => {

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UserName": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "SELECT",
            "MenuId": "5",
            "Page": 1,
            "RowPage": 20,
            "OrderBy": "id",
            "Order": "ASC"
        });

		var url = paths.URL_API_ADMIN + 'SubMenu';
		var Signature  = generateSignature(requestBody)

		setLoading(true)

		fetch(url, {
			method: "POST",
			body: requestBody,
			headers: {
				'Content-Type': 'application/json',
				'Signature': Signature
			},
		})
		.then(fetchStatus)
		.then(response => response.json())
		.then((data) => {
			setLoading(false)

			if (data.ErrCode === "0") {
				setListSubMenu(data.Result)
			} else {
				if (data.ErrCode === "2") {
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
					return false;
				} else {
					setErrorMessageAlert(data.ErrMessage);
					setShowAlert(true);
					return false;
				}
			}
		})
		.catch((error) => {
			setLoading(false)
			if (error.message === 401) {
				setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
				setShowAlert(true);
				return false;
			} else if (error.message !== 401) {
				setErrorMessageAlert(AlertMessage.failedConnect);
				setShowAlert(true);
				return false;
			}
		});
    }

    const handleMouseOver = (Id, idx) => {
        var IdIndex = idx.Id

        setIdIndex(Id)
        if (Id === IdIndex) {
            setIsHovering(true)
        }
    };
    
    const handleMouseOut = () => {
        setIdIndex("")
        setIsHovering(false)
    };

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
                    <div style={{ fontWeight:'bold', color:'#004372', fontSize:30 }}><FontAwesomeIcon icon={faServer}/> Master Data</div>
                    <p style={{ margin:0 }}>Here's Master Data from SIAM platform.</p>

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

                    <Row>
                        <Col xs={3} md={6} lg={12} style={{ paddingRight:6 }}>
                            {ListSubMenu.length > 0 && ListSubMenu.map((item,index) => {
                                var Icon = ""
                                if (item.SubMenu === "Daftar Siswa") {
                                    Icon = <FontAwesomeIcon icon={faGraduationCap}/>
                                } else if (item.SubMenu === "Daftar Guru") {
                                    Icon = <FontAwesomeIcon icon={faPersonChalkboard}/>
                                } else if (item.SubMenu === "Mata Pelajaran") {
                                    Icon = <FontAwesomeIcon icon={faBook}/>
                                } else if (item.SubMenu === "Ekstrakulikuler") {
                                    Icon = <FontAwesomeIcon icon={faBasketball}/>
                                } else if (item.SubMenu === "Organisasi") {
                                    Icon = <FontAwesomeIcon icon={faPeopleGroup}/>
                                } else if (item.SubMenu === "Bimbingan Konseling") {
                                    Icon = <FontAwesomeIcon icon={faHandsHolding}/>
                                } else if (item.SubMenu === "Penilaian Kepribadian") {
                                    Icon = <FontAwesomeIcon icon={faPersonCircleCheck}/>
                                } else if (item.SubMenu === "Jurusan") {
                                    Icon = <FontAwesomeIcon icon={faCodeBranch} />
                                } else {
                                    Icon = <FontAwesomeIcon icon={faGear}/>
                                }
                                return  <div style={{ 
                                    backgroundColor:'#EAECEE', 
                                    width:'100%', 
                                    marginBottom:10, 
                                    borderTopLeftRadius:10, 
                                    borderTopRightRadius:10, 
                                    borderBottomLeftRadius:10, 
                                    borderBottomRightRadius:10,
                                    border:item.Id === IdIndex && isHovering && '2px solid #004372',
                                    borderColor:item.Id === IdIndex && isHovering && '#004372',
                                    }} onMouseOver={() => handleMouseOver(item.Id, item)} onMouseOut={handleMouseOut}>
                                    <a href={"main"} style={{ textDecoration:'none' }} onClick={() => setCookie('anchorMasterData', item.SubMenu)}>
                                        <div style={{ display:'flex', padding:20, alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
                                            <div style={{ display:'flex', alignItems:'center', fontWeight:'bold', color:'#004372' }}>
                                                {Icon}<div style={{ paddingRight:10 }} />{item.SubMenu}
                                            </div>
                                            <FontAwesomeIcon icon={faChevronRight}/>
                                        </div>
                                    </a>
                                </div>
                            })}
                        </Col>
                    </Row>

                    {/* {StateTabsAdminAccess ?
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
                    } */}

                    <Gap height={10} />

                </div>
            </div>

        </div>
    )
}

export default User;