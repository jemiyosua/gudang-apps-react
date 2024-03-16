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
import { faArrowLeft, faCheckCircle, faCircle } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Markup } from 'interweave';

const InputRoleAccess = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);

    const [LoadingSave, setLoadingSave] = useState(false)
    const [RoleName, setRoleName] = useState("")

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
        }
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
    
    const simpanData = () => {

        let validasiMessage = "";

        if (RoleName === "") {
            validasiMessage = validasiMessage + "- Silahkan isi Role Name terlebih dahulu.\n";
        }
        
        if(validasiMessage !== ""){
            setValidationMessage(validasiMessage);
            setShowAlert(true)
            return false;
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UserName": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "INSERT",
            "RoleName": RoleName
        });

		var url = paths.URL_API_ADMIN + 'Roles';
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
                setSuccessMessage("Berhasil Insert Data")
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
                    setCookie('varHistoryPage', 'role')
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
                    <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Input Role Access</div>
                </button>
            </div>
            
            <div style={{ backgroundColor:'#FFFFFF', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, padding:20 }}>
                
                <div style={{ backgroundColor:'#FFFFFF', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20, paddingTop:30 }}>
                    <div style={{ color:'#004372', cursor:'pointer' }} onClick={() => {
                        history.push('/user')
                        setCookie('varHistoryPage', 'role')
                    }}><FontAwesomeIcon icon={faArrowLeft} /> Back</div>
                </div>

                <div style={{padding:20}}>
                    <Row>
                        <Col xs={12} md={12} lg={12}>
                            <div>
                            <div className='InputLabel'>Role Name</div>
                                <div>
                                    <Input
                                        required
                                        value={RoleName}
                                        onChange={event => setRoleName(event.target.value)}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
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

export default InputRoleAccess;