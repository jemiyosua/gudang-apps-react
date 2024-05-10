import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Dropdown, TextArea } from '../../../components';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus, FormatNumberBy3 } from '../../../utils/functions';
import { setForm } from '../../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import LabelTH from '../../../components/molecules/LabelTH'
import { Col, Row, Form, ListGroup, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faUserPlus, faArrowLeft, faArrowLeftRotate, faArrowsRotate, faEllipsisVertical, faUserPen, faPercent, faGraduationCap, faLayerGroup, faFileExcel, faFileImport, faBarcode, faTrash } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPaginate from 'react-paginate';
import 'react-loading-skeleton/dist/skeleton.css'
import { FaEye, FaPenSquare, FaTrash } from 'react-icons/fa';
import { Markup } from 'interweave'
import useScanDetection from 'use-scan-detection';
import { IconTrash } from '../../../assets';

const ScanProduct = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);

	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")
	const [Loading, setLoading] = useState(false)
	const [LoadingDetail, setLoadingDetail] = useState(false)
	const [LoadingStatus, setLoadingStatus] = useState(false)
    const [IdIndex, setIdIndex] = useState("")
    const [isHovering, setIsHovering] = useState(false)
    const [isHoveringNoEdit, setIsHoveringNoEdit] = useState(false)

	const [ListScanProduct, setListScanProduct] = useState([])
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
    const [ValidationMessage, setValidationMessage] = useState("")
    const [ConfirmMessage, setConfirmMessage] = useState("")

    const [ListBarcodeScan, setListBarcodeScan] = useState([])
    const [ListKategoriProduk, setListKategoriProduk] = useState([])
    const [CountScan, setCountScan] = useState(1)
    const [IdProdukDelete, setIdProdukDelete] = useState("")
    const [IndexProdukDelete, setIndexProdukDelete] = useState("")

    const [ProdukId, setProdukId] = useState("")
    const [Quantity, setQuantity] = useState("")
    const [TotalMultiply, setTotalMultiply] = useState("")
    const [StatusEditQuantity, setStatusEditQuantity] = useState(false)

    const handleScroll = (scrollOffset) => {
        if (containerRef.current) {
          containerRef.current.scrollLeft += scrollOffset;
        }
    };

    useScanDetection({
        onComplete: (code) => {
            if (CountScan === 1) {
                getDetailProduct(code, 1)
            } else {
                getDetailProduct(code, 2)
            }
        },
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
            dispatch(setForm("PageActive","KASIR"))

            // getListTransaksiJual(1, "", "", "")
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

    const handleMouseOver = (Id, item, position) => {
        var IdIndex = item.Id

        if (position === "edit") {
            setIdIndex(Id)
            if (Id === IdIndex) {
                setIsHovering(true)
            }
        } else {
            setIdIndex(Id)
            setIsHoveringNoEdit(true)
        }
    };
    
    const handleMouseOut = () => {
        setIdIndex("")
        setIsHovering(false)
        setIsHoveringNoEdit(false)
        // setEditablePrice(false)
    };

    const getDetailProduct = (productId, countScan) => {

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UserName": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "SELECT",
            "IdProduk": productId,
            "Page": 1,
            "RowPage": -1,
        });

		var url = paths.URL_API_ADMIN + 'ScanProduct';
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
			if (data.ErrorCode === "0") {
                if (countScan === 1) {
                    setCountScan(2)
                    setListScanProduct(data.Result)
                } else {
                    const newArray = [...ListScanProduct];
                    var newObj = { 
                        IdProduk: productId, 
                        NamaProduk: data.Result[0].NamaProduk,
                        CategoryProduct: data.Result[0].CategoryProduct,
                        HargaJual: data.Result[0].HargaJual,
                    };

                    if (newArray.length > 0) {
                        console.log("masuk if")
                        let searchId = newArray.find(item => item.IdProduk === productId);
                        if (searchId) {
                            console.log("barang sudah ada")
                        } else {
                            console.log("barang belum ada")
                            newArray.push(newObj)
                            setListScanProduct(newArray)
                        }
                    } else {
                        console.log("barang belum ada")
                        newArray.push(newObj)
                        setListScanProduct(newArray)
                    }
                }
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
        const newArray = [...ListScanProduct];
        newArray.splice(index, 1);
        setListScanProduct(newArray)
        setConfirmMessage("")
        setShowAlert(false)
        return
    }

    const hangleUpdateDetailProduk = (value, produkId, indexScan, input, price) => {
        var vListScanProduct = ListScanProduct

        var total = parseInt(value) * parseInt(price)

        console.log(total)
        
        vListScanProduct.map((item,index) => {
            if (produkId === item.IdProduk) {
                if (input === "qty") {
                    if (value === "") {
                        vListScanProduct[indexScan].Quantity = 0
                    } else {
                        vListScanProduct[indexScan].Quantity = parseInt(value)
                    }
                    vListScanProduct[indexScan].TotalMultiply = parseInt(total)
                }
            }
        })
        console.log(vListScanProduct)
        setListScanProduct(vListScanProduct)
    }

	const logout = ()=>{
        removeCookie('varCookie', { path: '/'})
        dispatch(setForm("ParamKey",''))
        dispatch(setForm("Username",''))
        if (window) {
            sessionStorage.clear();
		}
    }
    
    return (
		<div className="main-page">
            {/* <div className="content-wrapper-2" style={{ backgroundColor:'#F6FBFF', width:'100%' }} >
                <div className="blog-post"> */}
                    {/* <div style={{ fontWeight:'bold', color:'#004372', fontSize:30 }}><FontAwesomeIcon icon={faLayerGroup}/> Master Product</div> */}
                    {/* <p style={{ margin:0 }}>Here's for all Admin from SIAM platform.</p> */}

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
                    
                    {ConfirmMessage !== "" ?
                    <SweetAlert
                        warning
                        showCancel
                        show={ShowAlert}
                        confirmBtnText="Yes, delete it!"
                        confirmBtnBsStyle="danger"
                        title={ConfirmMessage}
                        onConfirm={() => handleDeleteProduk(IndexProdukDelete)}
                        onCancel={() => setShowAlert(false)}
                        >
                    </SweetAlert>
                    :""}
                    
                    {/* <Gap height={20} />
                    
                    <div>
                        <a href='master-data'>
                            <button role="tab" aria-controls="merchant-list">
                                <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Master Product</div>
                            </button>
                        </a>
                    </div> */}
                    
                    <div style={{ backgroundColor:'#FFFFFF', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20 }}>

                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                            <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                                <Thead>
                                    <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                        <Th className="tabelHeader"><LabelTH>Product ID</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Product Name</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Category Product</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Price</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Quantity</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Total</LabelTH></Th>
                                        <Th className="tabelHeader" colSpan={2}><LabelTH>Action</LabelTH></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {ListScanProduct.length > 0 ? ListScanProduct.map((item,index) => {   
                                    return <Tr style={{
                                        marginBottom:20,
                                        borderBottomWidth:1,
                                        borderBottom:'1px solid #004372',
                                        borderLeftWidth:1,
                                        borderRightWidth:1,
                                    }}>
                                            <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.IdProduk}</td>
                                            <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.NamaProduk}</td>
                                            <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.CategoryProduct}</td>
                                            <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{FormatNumberBy3(item.HargaJual)}</td>
                                            <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>
                                                <Input
                                                    required
                                                    value={StatusEditQuantity && ProdukId === item.IdProduk ? Quantity : item.Quantity}
                                                    onChange={event => setQuantity(event.target.value.replace(/\D/g, ''))}
                                                    onKeyDown={event => {
                                                        if (event.key === 'Enter') {
                                                            hangleUpdateDetailProduk(event.target.value, item.IdProduk, index, "qty", item.HargaJual)
                                                            event.target.blur()
                                                        }
                                                    }}
                                                    onBlur={event => {
                                                        setStatusEditQuantity(false)
                                                        hangleUpdateDetailProduk(event.target.value, item.IdProduk, index, "qty", item.HargaJual)
                                                    }}
                                                    onFocus={() => {
                                                        setStatusEditQuantity(true)
                                                        setProdukId(item.IdProduk)
                                                        setQuantity(item.Quantity)
                                                    }}
                                                />
                                            </td>
                                            <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.TotalMultiply === "" ? 'Rp. 0' : 'Rp. ' + FormatNumberBy3(item.TotalMultiply)}</td>
                                            <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>
                                                <img 
                                                    src={IconTrash}
                                                    style={{ height:20, width:20, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setIndexProdukDelete(index)
                                                        setIdProdukDelete(item.ProdukId)
                                                        setShowAlert(true)
                                                        setConfirmMessage("Are you sure want to delete " + item.NamaProduk + "?")
                                                    }}
                                                />
                                            </td>
                                        </Tr>;
                                    }) : <Tr><td colSpan="5" align="center" style={{ color:'red' }}>{"No Data Scanned"}</td></Tr>}
                                </Tbody>
                            </Table>

                            <Gap width={50} />

                            <div>Total: </div>
                        </div>
                        
                    </div>
                {/* </div>
            </div> */}
		</div>
    )
}

export default ScanProduct;