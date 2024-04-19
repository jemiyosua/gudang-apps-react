import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Dropdown, TextArea } from '../../../components';
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
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

const StokProduct = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);

	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")
	const [Loading, setLoading] = useState(false)
	const [LoadingStok, setLoadingStok] = useState(false)
    const [IdIndex, setIdIndex] = useState("")
    const [isHovering, setIsHovering] = useState(false)
    const [isHoveringNoEdit, setIsHoveringNoEdit] = useState(false)

	const [ListProduk, setListProduk] = useState([])
	const [ListProdukStok, setListProdukStok] = useState([])
	const [ListKategoriProduk, setListKategoriProduk] = useState([])
    const [IdStatus, setIdStatus] = useState("")
    const [ProdukId, setProdukId] = useState("")
    const [NamaProduk, setNamaProduk] = useState("")
    const [KategoriProduk, setKategoriProduk] = useState("")
    const [UserInput, setUserInput] = useState("")
    const [Status, setStatus] = useState("")
    const [ModalStokProduk, setModalStokProduk] = useState("")

    const [IdProdukModal, setIdProdukModal] = useState("")

    const [TotalData, setTotalData] = useState(0)
    const [TotalPages, setTotalPages] = useState(0)
    const [Paging, setPaging] = useState("")
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
    const [ValidationMessage, setValidationMessage] = useState("")
    const [ConfirmMessage, setConfirmMessage] = useState("")


    const handleScroll = (scrollOffset) => {
        if (containerRef.current) {
          containerRef.current.scrollLeft += scrollOffset;
        }
    };

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
            dispatch(setForm("PageActive","Stok Product"))

            getListKategoriProduk()
            getListProduk(1, "", "", "")
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

    const getListProduk = (Page, Position, SearchValue, SearchType) => {

        var SearchProdukId = ""
        var SearchNamaProduk = ""
        var SearchKategoriProduk = ""

        if (Position === "reset-filter") {
        } else {
            if (SearchType !== "") {
                if (SearchType === "produk_id") {
                    SearchProdukId = SearchValue
                } else if (SearchType === "nama_produk") {
                    SearchNamaProduk = SearchValue
                } else if (SearchType === "kategori_produk") {
                    setKategoriProduk(SearchValue)
                    SearchKategoriProduk = SearchValue
                }
            }
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UserName": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "SELECT",
            "ProdukId": SearchProdukId,
            "NamaProduk": SearchNamaProduk,
            "KategoriIdProduk": SearchKategoriProduk,
            "Page": Page,
            "RowPage": 20,
            "OrderBy": "dbmp.tgl_input",
            "Order": "DESC"
        });

		var url = paths.URL_API_ADMIN + 'MasterProduk';
		var Signature  = generateSignature(requestBody)

        setShowAlert(false)
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
				setListProduk(data.Result)
                setTotalData(data.TotalRecords)
                setTotalPages(data.TotalPage)
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

    const getListProdukStok = (ProdukId) => {

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UserName": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "SELECT",
            "KodeProduk": ProdukId,
            "Page": 1,
            "RowPage": -1,
            "OrderBy": "dbmp.tgl_input",
            "Order": "DESC"
        });

		var url = paths.URL_API_ADMIN + 'ProductStock';
		var Signature  = generateSignature(requestBody)

		setLoadingStok(true)

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
			setLoadingStok(false)

			if (data.ErrorCode === "0") {
				setListProdukStok(data.Result)
                setTotalData(data.TotalRecords)
                setTotalPages(data.TotalPage)
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

	const logout = ()=>{
        removeCookie('varCookie', { path: '/'})
        dispatch(setForm("ParamKey",''))
        dispatch(setForm("Username",''))
        if (window) {
            sessionStorage.clear();
		}
    }

    const handlePageClick = (data) => {
        let currentPage = data.selected + 1
        setPaging(data.selected)
        setListProduk([])
        getListProduk(currentPage, "", "", "")
    }
    
    return (
		<div className="main-page" style={{ backgroundColor:'#F6FBFF' }}>
            <div className="content-wrapper-2" style={{ backgroundColor:'#F6FBFF', width:'100%' }} >
                <div className="blog-post">
                    {/* <div style={{ fontWeight:'bold', color:'#004372', fontSize:30 }}><FontAwesomeIcon icon={faLayerGroup}/> Stok Product</div> */}
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
                    
                    {/* <Gap height={20} />
                    
                    <div>
                        <a href='stok-product'>
                            <button role="tab" aria-controls="merchant-list">
                                <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Stok Product</div>
                            </button>
                        </a>
                    </div> */}
                    
                    <div style={{ backgroundColor:'#FFFFFF', height:'auto', width:'100%', borderTopLeftRadius:25, borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20 }}>

                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <div style={{ display:'flex', justifyContent:'flex-start' }}>
                                <div 
                                    style={{ border:'2px solid #004372', padding:5, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} 
                                    onClick={() => {
                                        setStatus("")
                                        setProdukId("")
                                        setNamaProduk("")
                                        setKategoriProduk("")
                                        setUserInput("")
                                        getListProduk(1, "", "", "")
                                    }}>
                                    <FontAwesomeIcon icon={faArrowsRotate} style={{ height:15, width:25 }} />
                                </div>
                            </div>
                            {/* <div style={{  display:'flex', alignItems:'center'  }}>
                                <div style={{ border:'2px solid #004372', padding:10, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} onClick={() => history.push('scan-product')}>
                                    <div style={{ fontWeight:'bold', fontSize:13 }}><FontAwesomeIcon icon={faBarcode} /> Scan Product</div>
                                </div>
                            </div> */}
                        </div>
                        
                        <hr/>

                        <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                            <Thead>
                                <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                    <Th className="tabelHeader">
                                        <Input
                                            required
                                            placeholder='Search Produk Id'
                                            value={ProdukId}
                                            onChange={event => setProdukId(event.target.value)}
                                            onKeyDown={event => {
                                                if (event.key === 'Enter') {
                                                    getListProduk(1, "", event.target.value, "produk_id")
                                                    event.target.blur()
                                                }
                                            }}
                                        />
                                    </Th>
                                    <Th className="tabelHeader">
                                        <Input
                                            required
                                            placeholder='Search Nama Produk'
                                            value={NamaProduk}
                                            onChange={event => setNamaProduk(event.target.value)}
                                            onKeyDown={event => {
                                                if (event.key === 'Enter') {
                                                    getListProduk(1, "", event.target.value, "nama_produk")
                                                    event.target.blur()
                                                }
                                            }}
                                            onFocus={() => setNamaProduk("")}
                                        />
                                    </Th>
                                    <Th className="tabelHeader">
                                        <Dropdown onChange={event => {
                                            getListProduk(1, "", event.target.value, "kategori_produk")
                                            setKategoriProduk(event.target.value)
                                        }}>
                                        <option value="">Pilih Kategori</option>
                                        {ListKategoriProduk.length > 0 && ListKategoriProduk.map((item,index) => {
                                            return <option value={item.Id}>{item.NamaKategori}</option>
                                        })}
                                        </Dropdown>
                                    </Th>
                                </Tr>
                            </Thead>
                            <Thead>
                                <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                    <Th className="tabelHeader"><LabelTH>Produk Id</LabelTH></Th>
                                    <Th className="tabelHeader"><LabelTH>Nama Produk</LabelTH></Th>
                                    <Th className="tabelHeader"><LabelTH>Kategori Produk</LabelTH></Th>
                                    <Th className="tabelHeader"><LabelTH>Action</LabelTH></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Loading ? 
                                <Tr>
                                    <td colSpan="4" align="center">
                                        <div className="loader-container">
                                            <div className="spinner" />
                                        </div>
                                    </td>
                                </Tr>
                                :
                                ListProduk.length > 0 ? ListProduk.map((item,index)=>{
                                return <Tr style={{
                                    marginBottom:20,
                                    backgroundColor:item.Status === "0" ? '#EEEEEE' : 'white',
                                    borderTopWidth:1,
                                    borderTop:'2px solid #546E7A',
                                    borderBottom:item.Id === IdIndex && isHoveringNoEdit ? "2px solid #546E7A" : "white",
                                    borderTopColor:item.Id === IdIndex && isHoveringNoEdit ? "#546E7A" : "white",
                                    borderLeftColor:item.Id === IdIndex && isHoveringNoEdit ? "#546E7A" : "white",
                                    borderLeftWidth:1,
                                    borderLeft:item.Id === IdIndex && isHoveringNoEdit ? '2px solid #546E7A' : '2px solid white',
                                    borderRightColor:item.Id === IdIndex && isHoveringNoEdit ? "#546E7A" : "white",
                                    borderRightWidth:1,
                                    borderRight:item.Id === IdIndex && isHoveringNoEdit ? '2px solid #546E7A' : '2px solid white',
                                    textAlign:'left'
                                }} onMouseOver={() => handleMouseOver(item.Id, item, "no-edit")} onMouseOut={handleMouseOut}>
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.ProdukId}</td>
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.NamaProduk}</td>
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.KategoriNamaProduk === "" ? "-" : item.KategoriNamaProduk}</td>
                                        <td>
                                            <FaEye 
                                                style={{ height:20, width:20, cursor:'pointer' }} 
                                                onClick={() => {
                                                    getListProdukStok(item.ProdukId)
                                                    setModalStokProduk(true)
                                                }}
                                            />
                                        </td>
                                    </Tr>;
                                }) : <Tr><td colSpan="4" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
                                }
                            </Tbody>
                        </Table>

                        <hr/>

                        <Modal
                            show={ModalStokProduk}
                            size="lg"
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                            style={{ borderRadius:10}}
                            >
                            <Modal.Body>
                                <Gap height={20} />

                                <h3>Stok Product</h3>

                                <hr />

                                <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                                    <Thead>
                                        <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                            <Th className="tabelHeader"><LabelTH>Produk Id</LabelTH></Th>
                                            <Th className="tabelHeader"><LabelTH>Unit Produk</LabelTH></Th>
                                            <Th className="tabelHeader"><LabelTH>Quantity</LabelTH></Th>
                                            <Th className="tabelHeader"><LabelTH>Isi Produk</LabelTH></Th>
                                            <Th className="tabelHeader"><LabelTH>Total Produk</LabelTH></Th>
                                            <Th className="tabelHeader"><LabelTH>Tanggal Expired</LabelTH></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {LoadingStok ? 
                                        <Tr>
                                            <td colSpan="6" align="center">
                                                <div className="loader-container">
                                                    <div className="spinner" />
                                                </div>
                                            </td>
                                        </Tr>
                                        :
                                        ListProdukStok.length > 0 ? ListProdukStok.map((item,index) => {
                                            return <Tr style={{
                                                marginBottom:20,
                                                backgroundColor:item.Status === "0" ? '#EEEEEE' : 'white',
                                                borderTopWidth:1,
                                                borderTop:'2px solid #546E7A',
                                                borderBottom:item.Id === IdIndex && isHoveringNoEdit ? "2px solid #546E7A" : "white",
                                                borderTopColor:item.Id === IdIndex && isHoveringNoEdit ? "#546E7A" : "white",
                                                borderLeftColor:item.Id === IdIndex && isHoveringNoEdit ? "#546E7A" : "white",
                                                borderLeftWidth:1,
                                                borderLeft:item.Id === IdIndex && isHoveringNoEdit ? '2px solid #546E7A' : '2px solid white',
                                                borderRightColor:item.Id === IdIndex && isHoveringNoEdit ? "#546E7A" : "white",
                                                borderRightWidth:1,
                                                borderRight:item.Id === IdIndex && isHoveringNoEdit ? '2px solid #546E7A' : '2px solid white',
                                                textAlign:'left'
                                            }} onMouseOver={() => handleMouseOver(item.Id, item, "no-edit")} onMouseOut={handleMouseOut}>
                                                    <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.KodeProduk}</td>
                                                    <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.UnitProduk}</td>
                                                    <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.Quantity}</td>
                                                    <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.IsiProduk}</td>
                                                    <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.TotalProduk}</td>
                                                    <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.TanggalExpired}</td>
                                                </Tr>;
                                            }) : <Tr><td colSpan="6" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
                                        }
                                    </Tbody>
                                </Table>

                            </Modal.Body>

                            <Gap height={20} />
                            
                            <div style={{ display:'flex', justifyContent:'flex-end', padding:15, alignItems:'center' }}>
                                <div style={{ backgroundColor:'#3A379F', borderTopLeftRadius:8, borderTopRightRadius:8, borderBottomLeftRadius:8, borderBottomRightRadius:8, padding:10, width:150 }}>
                                    <div style={{ color:'#FFFFFF', textAlign:'center', fontWeight:'bold', cursor:'pointer' }} 
                                    onClick={() => setModalStokProduk(false)}
                                    >Close</div>
                                </div>
                            </div>
                        </Modal>

                        <div 
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems:'center',
                            }}
                        >
                            Total Data: {TotalData}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                padding: 20,
                                boxSizing: 'border-box',
                                alignItems:'center',
                            }}
                        >
                        <ReactPaginate
                            pageCount={TotalPages}
                            onPageChange={handlePageClick}
                            forcePage={Paging}
                            containerClassName={'pagination'}
                            pageClassName={'page-item'}
                            pageLinkClassName={'page-link'}
                            previousClassName={'page-item'}
                            previousLinkClassName={'page-link'}
                            nextClassName={'page-item'}
                            nextLinkClassName={'page-link'}
                            breakClassName={'page-item'}
                            breakLinkClassName={'page-link'}
                            activeClassName={'active'}
                        />
                        </div>
                        
                    </div>
                </div>
            </div>
		</div>
    )
}

export default StokProduct;