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
import { IconEye, IconRefresh } from '../../../assets';

const Transaksi = () => {
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

	const [ListTransaksiJual, setListTransaksiJual] = useState([])
	const [ListTransaksiJualDetail, setListTransaksiJualDetail] = useState([])
    const [TransaksiIdSearch, setTransaksiIdSearch] = useState("")
    const [TransaksiId, setTransaksiId] = useState("")
    const [ModalDetail, setModalDetail] = useState("")

    const [TotalData, setTotalData] = useState(0)
    const [TotalPages, setTotalPages] = useState(0)
    const [Paging, setPaging] = useState("")
    const [RoleAccess, setRoleAccess] = useState("")
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
    const [ValidationMessage, setValidationMessage] = useState("")

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
            dispatch(setForm("PageActive","KASIR"))

            getListTransaksiJual(1, "", "", "")
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

    const getListTransaksiJual = (Page, Position, SearchValue, SearchType) => {

        setShowAlert(false)

        var SearchTransaksiId = ""
        if (Position === "reset-filter") {
            // setFilter("")
            // setSearch("")
            // setFilterStatus("")
        } else {
            if (SearchType !== "") {
                if (SearchType === "transaksi_id") {
                    SearchTransaksiId = SearchValue
                }
            }
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UserName": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "SELECT",
            "TransaksiId": SearchTransaksiId,
            "Page": Page,
            "RowPage": 20,
            "OrderBy": "dbmp.tgl_input",
            "Order": "DESC"
        });

		var url = paths.URL_API_ADMIN + 'TransaksiJual';
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
				setListTransaksiJual(data.Result)
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

    const getListTransaksiJualDetail = (Page, SearchValue) => {

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UserName": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "SELECT",
            "TransaksiId": SearchValue,
            "Page": Page,
            "RowPage": 20,
            "OrderBy": "dbmp.tgl_input",
            "Order": "DESC"
        });

		var url = paths.URL_API_ADMIN + 'TransaksiJualDetail';
		var Signature  = generateSignature(requestBody)

		setLoadingDetail(true)

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
			setLoadingDetail(false)

			if (data.ErrorCode === "0") {
				setListTransaksiJualDetail(data.Result)
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
			setLoadingDetail(false)
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
        setListTransaksiJual([])
        getListTransaksiJual(currentPage, "", "", "")
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
                    
                    {/* <Gap height={20} />
                    
                    <div>
                        <a href='master-data'>
                            <button role="tab" aria-controls="merchant-list">
                                <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Master Product</div>
                            </button>
                        </a>
                    </div> */}
                    
                    <div style={{ backgroundColor:'#FFFFFF', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20 }}>

                        <>
                            <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
                                <div
                                    style={{ cursor:'pointer' }}
                                    onClick={() => {
                                        setTransaksiIdSearch("")
                                        getListTransaksiJual(1, "", "", "")
                                    }}>
                                    <img src={IconRefresh} />
                                </div>
                            </div>
                        
                            <br/>
                            <br/>

                            <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                                <Thead>
                                    <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                        <Th className="tabelHeader" style={{ paddingTop:20, paddingBottom:20 }}>
                                            <Input
                                                required
                                                placeHolder={'Transaksi ID ..'}
                                                value={TransaksiIdSearch}
                                                onChange={event => setTransaksiIdSearch(event.target.value)}
                                                onKeyDown={event => {
                                                    if (event.key === 'Enter') {
                                                        getListTransaksiJual(1, "", event.target.value, "transaksi_id")
                                                        event.target.blur()
                                                    }
                                                }}
                                            />
                                        </Th>
                                        <Th className="tabelHeader"><LabelTH>Jumlah Transaksi</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Total Transaksi</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>User Input</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Tanggal Transaksi</LabelTH></Th>
                                        <Th className="tabelHeader" colSpan={2}><LabelTH>Action</LabelTH></Th>
                                    </Tr>
                                </Thead>
                                {/* <Thead>
                                    <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                        <Th className="tabelHeader"><LabelTH>Transaksi ID</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Jumlah Transaksi</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Total Transaksi</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>User Input</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Tanggal Transaksi</LabelTH></Th>
                                        <Th className="tabelHeader" colSpan={2}><LabelTH>Action</LabelTH></Th>
                                    </Tr>
                                </Thead> */}
                                <Tbody>
                                    {Loading ? 
                                    <Tr>
                                        <td colSpan="9" align="center">
                                            <div className="loader-container">
                                                <div className="spinner" />
                                            </div>
                                            {/* <Skeleton count={ListProduk.length} /> */}
                                        </td>
                                    </Tr>
                                    :
                                    ListTransaksiJual.length > 0 ? ListTransaksiJual.map((item,index)=>{
                                    return <Tr style={{
                                        marginBottom:20,
                                        borderBottomWidth:1,
                                        borderBottom:'1px solid #004372',
                                        borderLeftWidth:1,
                                        borderRightWidth:1,
                                    }}>
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.TransaksiId}</td>
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.JumlahTransaksi}</td>
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{'Rp ' + FormatNumberBy3(item.TotalTransaksi)}</td>
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.UserInput}</td>
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.TanggalInput}</td>
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>
                                            <img 
                                                src={IconEye}
                                                style={{ height:20, width:20, cursor:'pointer' }} 
                                                onClick={() => {
                                                    setTransaksiId(item.TransaksiId)
                                                    getListTransaksiJualDetail(1, item.TransaksiId)
                                                    setModalDetail(true)
                                                }}
                                            />
                                            {/* <FaEye
                                                style={{ height:20, width:20, cursor:'pointer' }} 
                                                onClick={() => {
                                                    setTransaksiId(item.TransaksiId)
                                                    getListTransaksiJualDetail(1, item.TransaksiId)
                                                    setModalDetail(true)
                                                }}
                                            /> */}
                                        </td>
                                    </Tr>;
                                    }) : <Tr><td colSpan="9" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
                                    }
                                </Tbody>
                            </Table>

                            <br />

                            <Modal
                                show={ModalDetail}
                                size="lg"
                                aria-labelledby="contained-modal-title-vcenter"
                                centered
                                style={{ borderRadius:10 }}
                                >
                                <Modal.Body>
                                    <Gap height={20} />

                                    <h5 style={{ color:'#004372', fontWeight:'bold' }}>Transaction Details</h5>
                                    <h5 style={{ color:'#004372' }}>{TransaksiId}</h5>

                                    <br />

                                    <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                                        <Thead>
                                            <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                                {/* <Th className="tabelHeader"><LabelTH>Tranasksi ID</LabelTH></Th> */}
                                                <Th className="tabelHeader"><LabelTH>Product Name</LabelTH></Th>
                                                <Th className="tabelHeader"><LabelTH>Price</LabelTH></Th>
                                                <Th className="tabelHeader"><LabelTH>Quantity</LabelTH></Th>
                                                <Th className="tabelHeader"><LabelTH>Total</LabelTH></Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {LoadingDetail ? 
                                            <Tr>
                                                <td colSpan="6" align="center">
                                                    <div className="loader-container">
                                                        <div className="spinner" />
                                                    </div>
                                                </td>
                                            </Tr>
                                            :
                                            ListTransaksiJualDetail.length > 0 ? ListTransaksiJualDetail.map((item,index) => {
                                                return <Tr style={{
                                                    marginBottom:20,
                                                    borderBottomWidth:1,
                                                    borderBottom:'1px solid #004372',
                                                    borderLeftWidth:1,
                                                    borderRightWidth:1,
                                                }}>
                                                    {/* <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.TransaksiId}</td> */}
                                                    <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.NamaProduk}</td>
                                                    <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{'Rp. ' + FormatNumberBy3(item.HargaJual)}</td>
                                                    <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.Qty}</td>
                                                    <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20, fontWeight:'bold' }} onMouseOut={handleMouseOut}>{'Rp. ' + FormatNumberBy3(item.Total)}</td>
                                                </Tr>;
                                                }) : <Tr><td colSpan="6" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
                                            }
                                        </Tbody>
                                    </Table>

                                </Modal.Body>

                                <Gap height={20} />
                                
                                <div style={{ display:'flex', justifyContent:'flex-end', padding:15, alignItems:'center' }}>
                                    <div style={{ backgroundColor:'#004372', borderTopLeftRadius:8, borderTopRightRadius:8, borderBottomLeftRadius:8, borderBottomRightRadius:8, padding:10, width:150 }}>
                                        <div style={{ color:'#FFFFFF', textAlign:'center', fontWeight:'bold', cursor:'pointer' }} 
                                        onClick={() => setModalDetail(false)}
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
                        </>
                        
                    </div>
                {/* </div>
            </div> */}
		</div>
    )
}

export default Transaksi;