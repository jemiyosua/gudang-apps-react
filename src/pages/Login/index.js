import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap } from '../../components';
import './Login.css'
import { useDispatch } from 'react-redux';
// import { Button, Card, CardDeck, Modal } from 'react-bootstrap';
// import { setForm } from '../../redux';
import { AlertMessage, paths } from '../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../utils/functions';
// import { StarMallLandingPage, StarMallRocketMallLandingPage, StarMallLihatSemua, StarMallMakananMinuman, StarMallElektronikGadget, StarMallPeralatanKantor, StarMallJasaService, StarMallLeftArrow, StarMallRightArrow, StarMallProduct1, StarMallProduct2, StarMallProduct3, StarMallProduct4, StarMallStarRating, StarMallButtonComingSoon, StarMallButtonViewMore, StarMallMobilMotor, StarMallButtonCS, StarMallProperti, StarMallHobiOlahraga, StarMallKesehatan, StarMallVouchers } from '../../assets';
// import publicIP from 'react-native-public-ip';
// import { IconCloseGray } from '../../admin/assets';
import md5 from 'md5';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Markup } from 'interweave';
import { setForm } from '../../redux';
import { LogoMethodist } from '../../assets';

const Login = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const [cookies, setCookie, removeCookie] = useCookies(['user']);
    const [Loading, setLoading] = useState(false)
    const [Username, setUsername] = useState();
    const [Password, setPassword] = useState();
    const [ShowAlert, setShowAlert] = useState(true);
    const [ValidationMessage, setValidationMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")

	useEffect(() => {
        window.scrollTo(0, 0)

        var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

        if ((CookieParamKey == null && CookieParamKey == null) && (CookieUsername == null && CookieUsername == null)) {
            logout()
            history.push('/admin/login');
            return
        } else {
            // setEmail(CookieUserID)
            // setPassword(cookies.CookiePass)
            history.push('/admin/dashboard');
            return
        }
    },[])

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

    const SubmitLogin = () => {

        let validasiMessage = "";
        if (Username === "") {
            validasiMessage = validasiMessage + "- Silahkan isi Username terlebih dahulu.\n";
        }

        if (Password === "") {
            validasiMessage = validasiMessage + "- Silahkan isi Password terlebih dahulu.\n";
        }

        if (validasiMessage !== "") {
            setValidationMessage(validasiMessage);
            setShowAlert(true);
            return false;
        } else {

            var requestBody = JSON.stringify({
                "Username": Username,
                "Password": md5(Password)
            });

            console.log("LOGIN REQUEST : " + requestBody)

            var url = paths.URL_API_ADMIN + 'Login';
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

                console.log("LOGIN RESPONSE : " + JSON.stringify(data))

                if (data.ErrCode === "0") {
                    const date = new Date();
                    date.setDate(date.getDate() + 1);            
                    
                    setCookie('varCookie', data.UserName + "|" + data.ParamKey + "|" + data.Name + "|" + data.Role, { path: '/', expires: new Date(date) })
                    dispatch(setForm("ParamKey", data.ParamKey))
                    dispatch(setForm("UserName", data.UserName))
                    dispatch(setForm("Name", data.Name))
                    dispatch(setForm("Role", data.Role))

                    window.location.href="/admin/dashboard"

                } else {
                    setErrorMessageAlert(data.ErrMessage);
                    setShowAlert(true);
                    return false;
                }
            })
            .catch((error) => {
                setLoading(false)
                if (error.message == 401) {
                    setErrorMessageAlert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
                    setShowAlert(true);
                    return false;
                } else if (error.message != 401) {
                    setErrorMessageAlert(AlertMessage.failedConnect);
                    setShowAlert(true);
                    return false;
                }
            });
        }
    }
    
    return (
        <div className="main-page" style={{ justifyContent: "center", height: "100vh", backgroundColor: "#F6FBFF", paddingTop: "10%", paddingBottom: "10%" }}>
            <div className="right" style={{ borderRadius:15 }}>
                <div style={{ display: 'flex', textAlign: 'center', alignItems: 'center', alignSelf: 'center' }}>
                    {/* <img src={LogoMethodist} style={{ width: 130, marginRight: 10, borderRadius: 4 }} /> */}
                </div>

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
                : ""}
                
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
                            <p style={{ fontSize: '20px', textAlign: 'left' }}><Markup content={ValidationMessage} /></p>
                        </div>
                    )}
                </SweetAlert>
                : ""}

                <Gap height={30} />

                <p className="title" style={{ textAlign:'center' }}>Methodist 1</p>

                <Input 
                    label="Username" 
                    placeholder="Username"
                    value={Username}
                    style={{backgroundColor: "#F6FBFF"}}
                    onChange={event => {
                        setUsername(event.target.value)
                        dispatch(setForm("Username", event.target.value))
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            SubmitLogin()
                            event.target.blur()
                        }
                    }}
                />
                
                <Gap height={18} />

                <Input label="Password" placeholder="Password"
                    value={Password}
                    type="password"
                    style={{backgroundColor: "#F6FBFF"}}
                    onChange={event => {
                        setPassword(event.target.value)
                        dispatch(setForm("Password", event.target.value))
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            SubmitLogin()
                            event.target.blur()
                        }
                    }}
                />
                
                <Gap height={30} />
                
                <Button 
                    spinner={Loading} 
                    title="Login" 
                    onClick={() => SubmitLogin()} 
                    style={{ backgroundColor:"#004372", textAlign:'center', color:'#FFFFFF', borderRadius:10 }} 
                />
                {/* <Button title="TES" onClick={()=>Test()}/> */}
                <Gap height={100} />
                {/* <Link title="Belum punya akun, silahkan daftar"  onClick={()=>history.push('/register')}/> */}

            </div>
        </div>
    )
}

export default Login;
