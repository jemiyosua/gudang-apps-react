import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../../utils/functions';
import { setForm } from '../../../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Col, Row, Form, ListGroup, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle, faCircle, faTrash, faUserPen } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Markup } from 'interweave';
import { read, utils, writeFile } from 'xlsx';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import LabelTH from '../../../../components/molecules/LabelTH'

const ImportProduct = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);

    const [Loading, setLoading] = useState(false)
    const [LoadingSave, setLoadingSave] = useState(false)
    const [ListProduk, setListProduk] = useState([])
    const [IdProduk, setIdProduk] = useState("")
    const [Username, setUsername] = useState("")
    const [Nama, setNama] = useState("")
    const [Password, setPassword] = useState("")
    const [RePassword, setRePassword] = useState("")
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
        var CookieRole = getCookie("role");
        
        if (CookieParamKey == null || CookieParamKey === "" || CookieUsername == null || CookieUsername === "") {
            logout()
            window.location.href="admin/login";
            return false;
        } else {
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","Gudang"))
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

        var errorMessage = ""
        ListProduk.map((item,index) => {
            if (item.kategori_produk === "" || item.kategori_produk === null) {
                errorMessage += "- Kategori untuk produk " + item.nama_produk + " tidak boleh kosong \n"
            }
        })

        if (errorMessage !== "") {
            setValidationMessage(errorMessage)
            setShowAlert(true)
            return
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "Username": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "INSERT",
            "MasterProdukList": ListProduk
		});

		var url = paths.URL_API_ADMIN + 'MasterProduk';
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

			if (data.ErrorCode === "0") {
                setSuccessMessage("Berhasil Insert Data")
                setShowAlert(true)
			} else {
				if (data.ErrorCode === "2") {
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

    const handleImport = ($event) => {
        const files = $event.target.files;
        if (files.length) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const wb = read(event.target.result);
                const sheets = wb.SheetNames;

                if (sheets.length) {
                    const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
                    rows.map((item,index) => {
                        // const date = rows[index].tgl_expired
                        // const dateValue = utils.format_date(date, 'yyyy/mm/dd');
                        rows[index]["user_input"] = getCookie("username")
                        // rows[index]["tgl_expired"] = dateValue
                    })
                    
                    setListProduk(rows)
                }
            }
            reader.readAsArrayBuffer(file);
        }
    }

    const handleDeleteProduk = (index) => {
        const newArray = [...ListProduk];
        newArray.splice(index, 1);
        setListProduk(newArray)
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
					history.replace("/master-product")
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
            
            {/* <div>
                <button role="tab" aria-controls="merchant-list">
                    <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Import Product</div>
                </button>
            </div> */}
            
            <div style={{ backgroundColor:'#FFFFFF', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25 }}>

                <hr/>

                <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <input 
                        type="file" 
                        name="file"
                        required 
                        onChange={handleImport}
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    />

                    <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
                        {LoadingSave ?
                        <div className="loader-container-small">
                            <div className="spinner-small" />
                        </div>
                        :
                        <div>
                            <div style={{  fontWeight:'bold', textAlign:'center', color:'red', marginBottom:10  }}>Total Data : {ListProduk.length}</div>
                            <div style={{ border:'2px solid #004372', padding:10, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} onClick={() => simpanData()}>
                                <div style={{ fontWeight:'bold', fontSize:13 }}><FontAwesomeIcon icon={faCheckCircle} /> Simpan Data</div>
                            </div>
                        </div>
                        }
                    </div>
                </div>

                <hr/>

                <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                    <Thead>
                        <Tr style={{ color:"#004372", borderColor:'white', textAlign:'left' }}>
                            <Th className="tabelHeader"><LabelTH>Produk Id</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Nama Produk</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Kategori Produk</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Harga Jual (Rp)</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Harga Beli (Rp)</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Unit</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Quantity</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Jumlah (isi)</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Tanggal Expired (YYYY/MM/DD)</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>User Input</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Action</LabelTH></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {ListProduk.length > 0 && ListProduk.map((item,index)=>{
                        return <Tr style={{ textAlign:'left' }}>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20, fontWeight:'bold' }}>{item.produk_id}</td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20, fontWeight:'bold' }}>{item.nama_produk}</td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>{item.kategori_produk === "" ? "-" : item.kategori_produk}</td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>{item.harga_beli}</td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>{item.harga_jual}</td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>{item.unit}</td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>{item.qty}</td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>{item.isi}</td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>{item.tgl_expired}</td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>{item.user_input}</td>
                                <td>
                                    <FontAwesomeIcon icon={faTrash} style={{ height:20, width:20, cursor:'pointer' }} onClick={() => {
                                        handleDeleteProduk(index)
                                    }}/>
                                </td>
                            </Tr>;
                        })}
                    </Tbody>
                </Table>
            </div>
		</div>
    )
}

export default ImportProduct;