import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Dropdown } from '../../../../components';
// import './User.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../../utils/functions';
import { setForm } from '../../../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Col, Row, Form, ListGroup, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Markup } from 'interweave';

const UpdateAdminAccess = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);

    const [LoadingSave, setLoadingSave] = useState(false)
    const [Username, setUsername] = useState("")
    const [Nama, setNama] = useState("")
    const [Password, setPassword] = useState("")
    const [RePassword, setRePassword] = useState("")
    const [UserId, setUserId] = useState("")
    const [ListAccess, setListAccess] = useState([
        {
            "Id": "1",
            "Access": "ADMINISTRATOR",
            "Status": "1"
        },
        {
            "Id": "2",
            "Access": "SISWA",
            "Status": "1"
        },
        {
            "Id": "3",
            "Access": "GURU",
            "Status": "1"
        },
        {
            "Id": "4",
            "Access": "STAFF",
            "Status": "1"
        },
        {
            "Id": "5",
            "Access": "ORANG TUA",
            "Status": "0"
        }
    ])
    const [Access, setAccess] = useState("")
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
    const [ValidationMessage, setValidationMessage] = useState("")

	useEffect(() => {
        window.scrollTo(0, 0)

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

            getDetailUser()
        }

    },[])

	const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        var UserId = cookies.varUserId;

        if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie == "string") {
            var LongSecretCookie = SecretCookie.split("|");
            var UserName = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var Nama = LongSecretCookie[2];
            var Role = LongSecretCookie[3];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)
        
            if (tipe === "username") {
                return UserName       
            } else if (tipe === "paramkey") {
                return ParamKey
            } else if (tipe === "nama") {
                return Nama
            } else if (tipe === "role") {
                return Role
            } else if (tipe === "userid") {
                return UserId
            } else {
                return null
            }
        } else {
            return null
        }
    }

    const getDetailUser = () => {

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");
        var UserId = getCookie("userid");

        setUserId(UserId)

		var requestBody = JSON.stringify({
			"UsernameSession": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "SELECT",
            "Id": UserId,
			"Page": 1,
			"RowPage": 20,
			"OrderBy": "id",
			"Order": "ASC"
		});

		var url = paths.URL_API_ADMIN + 'UserLogin';
		var Signature  = generateSignature(requestBody)

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

			if (data.ErrCode === "0") {
                setUsername(data.Result[0].Username)
                setNama(data.Result[0].Nama)
                setAccess(data.Result[0].Role)
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
    
    const simpanData = () => {

        let validasiMessage = "";

        if (Username === "") {
            validasiMessage = validasiMessage + "- Silahkan isi Username terlebih dahulu.\n";
        } else if (Username.length < 5) {
            validasiMessage = validasiMessage + "- Username minimal 5 karakter.\n";
        } else if (Username.length > 50) {
            validasiMessage = validasiMessage + "- Username maksimal 50 karakter.\n";
        }

        if (Nama === "") {
            validasiMessage = validasiMessage + "- Silahkan isi Nama terlebih dahulu.\n";
        } else if (Nama.length < 5) {
            validasiMessage = validasiMessage + "- Nama minimal 5 karakter.\n";
        } else if (Nama.length > 50) {
            validasiMessage = validasiMessage + "- Nama maksimal 50 karakter.\n";
        }

        if (Password === "") {
            validasiMessage = validasiMessage + "- Silahkan isi password terlebih dahulu.\n";
        } else if (Password.length < 1) {
            validasiMessage = validasiMessage + "- Password minimal 1 digit/karakter.\n";
        }

        if (RePassword === "") {
            validasiMessage = validasiMessage + "- Silahkan isi re password terlebih dahulu.\n";
        }

        if (Password !== RePassword) {
            validasiMessage = validasiMessage + "- password dan Re password harus sama\n";
        }

        if(Access === ""){
            validasiMessage = validasiMessage + "- Silahkan pilih Akses menu terlebih dahulu.\n";
        }
        
        if(validasiMessage!=""){
            setValidationMessage(validasiMessage);
            setShowAlert(true)
            return false;
        }

        // if (Access == "VIEWER") {
        //     Menu = "2"
        // } else if (Access == "CS") {
        //     Menu = "2,7"
        // } else if (Access == "EDITOR") {
        //     Menu = "1,2,3,4,5,6,7"
        // } else if (Access == "ADMINISTRATOR") {
        //     Menu = "1,2,3,4,5,6,7"
        // }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UsernameSession": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "UPDATE",
            "Id": UserId,
            "UsernameMaster": Username,
            "Nama": Nama,
            "Password": Password,
            "Role": Access
		});


		var url = paths.URL_API_ADMIN + 'UserLogin';
		var Signature  = generateSignature(requestBody)

        setLoadingSave(true)

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

            setLoadingSave(false)

			if (data.ErrCode === "0") {
                setSuccessMessage("Berhasil Update Data")
                setShowAlert(true)
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

            setLoadingSave(false)

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

	const logout = ()=>{
        removeCookie('varCookie', { path: '/'})
        removeCookie('varMerchantId', { path: '/'})
        removeCookie('varIdVoucher', { path: '/'})
        dispatch(setForm("ParamKey",''))
        dispatch(setForm("Username",''))
        dispatch(setForm("Name",''))
        dispatch(setForm("Role",''))
        if (window) {
            sessionStorage.clear();
		}
    }
    
    return (
		<div>
			{SessionMessage !== "" ?
			<SweetAlert 
				warning 
				show={ShowAlert}
				onConfirm={() => {
					setShowAlert(false)
					logout()
					window.location.href="/";
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
					history.replace("/user")
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
            
            {ValidationMessage !== "" ?
            <SweetAlert
                show={ShowAlert}
                onConfirm={() => {
                    setShowAlert(false)
                    setValidationMessage("")
                }}
                onEscapeKey={() => setShowAlert(false)}
                onOutsideClick={() => setShowAlert(false)}
                btnSize="sm"
                >
                {() => (
                    <div>
                        <p style={{fontSize:'20px', textAlign:'left'}}><Markup content={ValidationMessage}/></p>
                    </div>
                )}
            </SweetAlert>
            :""}
            
            <div>
                <button role="tab" aria-controls="merchant-list">
                    <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Update Admin Access</div>
                </button>
            </div>
            
            <div style={{backgroundColor:'white', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, padding:20, paddingTop:30}}>
                
                <div style={{ backgroundColor:'#FFFFFF', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20, paddingTop:30 }}>
                    <div style={{ color:'#004372', cursor:'pointer' }} onClick={() => history.push('/user')}><FontAwesomeIcon icon={faArrowLeft} /> Back</div>
                </div>

                <div style={{padding:20}}>
                    <Row>
                        <Col xs={12} md={6} lg={6}>
                            <div>
                            <div className='InputLabel'>Username</div>
                                <div>
                                    <Input
                                        required
                                        value={Username}
                                        onChange={event => setUsername(event.target.value)}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} md={6} lg={6}>
                            <div>
                            <div className='InputLabel'>Nama</div>
                                <div>
                                    <Input
                                        required
                                        value={Nama}
                                        onChange={event => setNama(event.target.value)}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Gap height={20}></Gap>
                    <Row>
                        <Col xs={12} md={6} lg={6}>
                            <div>
                                <div className='InputLabel'>Password</div>
                                <div>
                                    <Input 
                                        type="password"
                                        value={Password} 
                                        onChange={event=>setPassword(event.target.value)}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} md={6} lg={6}>
                            <div>
                                <div className='InputLabel'>Re - Password</div>
                                <div>
                                    <Input 
                                        type="password"
                                        value={RePassword} 
                                        onChange={event=>setRePassword(event.target.value)}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <hr />

                    <div style={{ fontWeight:'bold' }}>Access</div>
                    
                    <div>
                        <div style={{ paddingTop: 5, display: 'flex' }}>
                            {ListAccess.length > 0 && ListAccess.map((item,index) => {
                                return <div style={{ marginRight:30, display:'flex' }}>
                                    <input
                                        disabled={item.Status === "1" ? false : true}
                                        type="radio" 
                                        value={item.Access}
                                        style={{ padding:10 }}
                                        checked={Access === item.Access}
                                        onChange={event => setAccess(event.target.value)}
                                    />
                                    <div style={{ marginRight:10 }} />
                                    <div style={{ color: item.Status === "1" ? '#000000' : 'red', opacity: item.Status === "1" ? 1 : .3 }}>{item.Access}</div>
                                </div>
                            })}
                        </div>
                    </div>
                    
                </div>

                <div style={{display:'flex', justifyContent:'flex-end', padding:20}}>
                    {LoadingSave ?
                    <div className="loader-container-small">
                        <div className="spinner-small" />
                    </div>
                    :
                    <div style={{ border:'2px solid #004372', padding:10, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} onClick={() => simpanData()}>
                        <div style={{ fontWeight:'bold', fontSize:13 }}><FontAwesomeIcon icon={faCheckCircle} /> Save Changes</div>
                    </div>
                    }
                </div>
            </div>
		</div>
    )
}

export default UpdateAdminAccess;