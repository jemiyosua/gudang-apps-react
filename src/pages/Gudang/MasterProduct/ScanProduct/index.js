import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Dropdown } from '../../../../components';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../../utils'
import { historyConfig, generateSignature, fetchStatus, validEmail } from '../../../../utils/functions';
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
import useScanDetection from 'use-scan-detection';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

const ScanProduct = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);

    const [Loading, setLoading] = useState(false)
    const [LoadingSave, setLoadingSave] = useState(false)
    const [ListBarcodeScan, setListBarcodeScan] = useState([])
    const [ListKategoriProduk, setListKategoriProduk] = useState([])
    const [ProdukId, setProdukId] = useState("")
    const [NamaProduk, setNamaProduk] = useState("")
    const [HargaBeli, setHargaBeli] = useState("")
    const [HargaJual, setHargaJual] = useState("")
    const [Quantity, setQuantity] = useState("")
    const [Isi, setIsi] = useState("")
    const [TanggalExpired, setTanggalExpired] = useState("")
    
    const [StatusEditNamaProduk, setStatusEditNamaProduk] = useState(false)
    const [StatusEditHargaBeli, setStatusEditHargaBeli] = useState(false)
    const [StatusEditHargaJual, setStatusEditHargaJual] = useState(false)
    const [StatusEditQuantity, setStatusEditQuantity] = useState(false)
    const [StatusEditIsi, setStatusEditIsi] = useState(false)

	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
    const [ValidationMessage, setValidationMessage] = useState("")

    useScanDetection({
        onComplete: (code) => {
            var CookieUsername = getCookie("username");
            const newArray = [...ListBarcodeScan];
            var newObj = { 
                produk_id: code, 
                nama_produk: '',
                kategori_produk: '',
                harga_beli: '',
                harga_jual: '',
                unit: '',
                qty: '',
                isi: '',
                tanggal_expired: '',
                user_input: CookieUsername
            };

            if (newArray.length > 0) {
                let searchId = newArray.find(item => item.produk_id === code);
                if (searchId) {
                    console.log("barang sudah ada")
                } else {
                    console.log("barang belum ada")
                    newArray.push(newObj)
                    setListBarcodeScan(newArray)
                    getListKategoriProduk()
                }
            } else {
                console.log("barang belum ada")
                newArray.push(newObj)
                setListBarcodeScan(newArray)
                getListKategoriProduk()
            }
        },
        minLength: 13
    });

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

    const getListKategoriProduk = () => {

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UserName": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "SELECT",
            "Status": "1",
            "Page": 1,
            "RowPage": -1,
            "OrderBy": "",
            "Order": ""
        });

		var url = paths.URL_API_ADMIN + 'Category';
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

			if (data.ErrorCode === "0") {
				setListKategoriProduk(data.Result)
			} else {
				if (data.ErrorCode === "2") {
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
					return false;
				} else {
					setErrorMessageAlert(data.ErrorMessage);
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
    
    const simpanData = () => {

        // var errorMessage = ""
        // ListBarcodeScan.map((item,index) => {
        //     if (item.kategori_produk === "" || item.kategori_produk === null) {
        //         errorMessage += "- Kategori untuk produk " + item.nama_produk + " tidak boleh kosong \n"
        //     }
        // })

        // if (errorMessage !== "") {
        //     setValidationMessage(errorMessage)
        //     setShowAlert(true)
        //     return
        // }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "Username": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "INSERT",
            "MasterProdukList": ListBarcodeScan
		});

        console.log("MASTER PRODUK JSON REQUEST : " + requestBody)

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

    const handleDeleteProduk = (index) => {
        const newArray = [...ListBarcodeScan];
        newArray.splice(index, 1);
        setListBarcodeScan(newArray)

    }

    const hangleUpdateDetailProduk = (value, produkId, indexScan, input) => {
        var vListBarcodeScan = ListBarcodeScan

        vListBarcodeScan.map((item,index) => {
            if (produkId === item.produk_id) {
                if (input === "nama_produk") {
                    vListBarcodeScan[indexScan].nama_produk = value
                } else if (input === "kategori_produk") {
                    vListBarcodeScan[indexScan].kategori_produk = value
                } else if (input === "harga_beli") {
                    vListBarcodeScan[indexScan].harga_beli = parseInt(value)
                } else if (input === "harga_jual") {
                    vListBarcodeScan[indexScan].harga_jual = parseInt(value)
                } else if (input === "unit") {
                    vListBarcodeScan[indexScan].unit = value
                } else if (input === "qty") {
                    vListBarcodeScan[indexScan].qty = parseInt(value)
                } else if (input === "isi") {
                    vListBarcodeScan[indexScan].isi = parseInt(value)
                } else if (input === "tanggal_expired") {
                    vListBarcodeScan[indexScan].tanggal_expired = value
                }
            }
        })
        console.log(vListBarcodeScan)
        setListBarcodeScan(vListBarcodeScan)
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
            
            <div style={{ backgroundColor:'#FFFFFF', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25 }}>

                <hr/>

                <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
                    {LoadingSave ?
                    <div className="loader-container-small">
                        <div className="spinner-small" />
                    </div>
                    :
                    <div>
                        <div style={{  fontWeight:'bold', textAlign:'center', color:'red', marginBottom:10  }}>Total Data : {ListBarcodeScan.length}</div>
                        <div style={{ border:'2px solid #004372', padding:10, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} onClick={() => simpanData()}>
                            <div style={{ fontWeight:'bold', fontSize:13 }}><FontAwesomeIcon icon={faCheckCircle} /> Simpan Data</div>
                        </div>
                    </div>
                    }
                </div>

                <hr/>

                <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                <Thead>
                        <Tr style={{ color:"#004372", borderColor:'white', textAlign:'left' }}>
                            <Th className="tabelHeader"><LabelTH>Produk Id</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Nama Produk</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Kategori Produk</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Harga Beli (Rp)</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Harga Jual (Rp)</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Unit</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Quantity</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Jumlah (isi)</LabelTH></Th>
                            <Th className="tabkeHeader"><LabelTH>Tanggal Expired</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>User Input</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Action</LabelTH></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {ListBarcodeScan.length > 0 ? ListBarcodeScan.map((item,index)=>{
                        return <Tr style={{ textAlign:'left' }}>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20, fontWeight:'bold' }}>{item.produk_id}</td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20, fontWeight:'bold' }}>
                                    <Input
                                        required
                                        value={StatusEditNamaProduk && ProdukId === item.produk_id ? NamaProduk : item.nama_produk}
                                        onChange={event => setNamaProduk(event.target.value)}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter') {
                                                hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "nama_produk")
                                                event.target.blur()
                                            }
                                        }}
                                        onBlur={event => {
                                            setStatusEditNamaProduk(false)
                                            hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "nama_produk")
                                        }}
                                        onFocus={() => {
                                            setProdukId(item.produk_id)
                                            setNamaProduk(item.nama_produk)
                                            setStatusEditNamaProduk(true)
                                        }}
                                    />
                                </td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>
                                    <Dropdown onChange={(event) => hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "kategori_produk")}>
                                        <option value="">Pilih Kategori</option>
                                    {ListKategoriProduk.length > 0 && ListKategoriProduk.map((itemKategori,indexKategori) => {
                                        return <option value={itemKategori.Id}>{itemKategori.NamaKategori}</option>
                                    })}
                                    </Dropdown>
                                </td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>
                                    <Input
                                        required
                                        value={StatusEditHargaBeli && ProdukId === item.produk_id ? HargaBeli : item.harga_beli}
                                        onChange={event => setHargaBeli(event.target.value)}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter') {
                                                hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "harga_beli")
                                                event.target.blur()
                                            }
                                        }}
                                        onBlur={event => {
                                            setStatusEditHargaBeli(false)
                                            hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "harga_beli")
                                        }}
                                        onFocus={() => {
                                            setStatusEditHargaBeli(true)
                                            setProdukId(item.produk_id)
                                            setHargaBeli(item.harga_beli)
                                        }}
                                    />
                                </td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>
                                    <Input
                                        required
                                        value={StatusEditHargaJual && ProdukId === item.produk_id ? HargaJual : item.harga_jual}
                                        onChange={event => setHargaJual(event.target.value)}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter') {
                                                hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "harga_jual")
                                                event.target.blur()
                                            }
                                        }}
                                        onBlur={event => {
                                            setStatusEditHargaJual(false)
                                            hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "harga_jual")
                                        }}
                                        onFocus={() => {
                                            setStatusEditHargaJual(true)
                                            setProdukId(item.produk_id)
                                            setHargaJual(item.harga_jual)
                                        }}
                                    />
                                </td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>
                                    <Dropdown onChange={(event) => hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "unit")}>
                                        <option value="">Pilih Unit</option>
                                        <option value="pcs">Pcs</option>
                                        <option value="pack">Pack</option>
                                    </Dropdown>
                                </td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>
                                    <Input
                                        required
                                        value={StatusEditQuantity && ProdukId === item.produk_id ? Quantity : item.qty}
                                        onChange={event => setQuantity(event.target.value)}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter') {
                                                hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "qty")
                                                event.target.blur()
                                            }
                                        }}
                                        onBlur={event => {
                                            setStatusEditQuantity(false)
                                            hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "qty")
                                        }}
                                        onFocus={() => {
                                            setStatusEditQuantity(true)
                                            setProdukId(item.produk_id)
                                            setQuantity(item.qty)
                                        }}
                                    />
                                </td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>
                                    <Input
                                        required
                                        value={StatusEditIsi && ProdukId === item.produk_id ? Isi : item.isi}
                                        onChange={event => setIsi(event.target.value)}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter') {
                                                hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "isi")
                                                event.target.blur()
                                            }
                                        }}
                                        onBlur={event => {
                                            setStatusEditIsi(false)
                                            hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "isi")
                                        }}
                                        onFocus={() => {
                                            setStatusEditIsi(true)
                                            setProdukId(item.produk_id)
                                            setIsi(item.isi)
                                        }}
                                    />
                                </td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>
                                    <Form.Control 
                                        type="date"
                                        onChange={event => hangleUpdateDetailProduk(event.target.value, item.produk_id, index, "tanggal_expired")}
                                    />
                                </td>
                                <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }}>{item.user_input}</td>
                                <td>
                                    <FontAwesomeIcon icon={faTrash} style={{ height:20, width:20, cursor:'pointer' }} onClick={() => {
                                        handleDeleteProduk(index)
                                    }}/>
                                </td>
                            </Tr>;
                        }) : <Tr><td colSpan={11} style={{  textAlign:'center', fontWeight:'bold', color:'red'  }}>No Barcode Scanned</td></Tr>}
                    </Tbody>
                </Table>
            </div>
		</div>
    )
}

export default ScanProduct;