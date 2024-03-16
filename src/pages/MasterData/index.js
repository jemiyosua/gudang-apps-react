import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Dropdown } from '../../components';
import './Tab.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../utils/functions';
import { setForm } from '../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import LabelTH from '../../components/molecules/LabelTH'
import { Col, Row, Form, ListGroup, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faUserPlus, faArrowLeft, faArrowLeftRotate, faArrowsRotate, faEllipsisVertical, faUserPen, faPercent, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPaginate from 'react-paginate';

const MasterData = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);

	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")
	const [Loading, setLoading] = useState(false)
	const [LoadingStatus, setLoadingStatus] = useState(false)
    const [IdIndex, setIdIndex] = useState("")
    const [isHovering, setIsHovering] = useState(false)
    const [isHoveringNoEdit, setIsHoveringNoEdit] = useState(false)

	const [ListSiswa, setListSiswa] = useState([])
    const [IdStatus, setIdStatus] = useState("")
    const [Filter, setFilter] = useState("")
    const [FilterPopup, setFilterPopup] = useState(false)
    const [Search, setSearch] = useState("")
    const [FilterStatus, setFilterStatus] = useState("")
    const [TotalData, setTotalData] = useState(0)
    const [TotalPages, setTotalPages] = useState(0)
    const [Paging, setPaging] = useState("")
    const [RoleAccess, setRoleAccess] = useState("")
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")


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
            dispatch(setForm("PageActive","Master Data"))

            setRoleAccess(CookieRole)
            getListItem(1, "")
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

    const getListItem = (Page, Position) => {

        var SearchNama = ""
        var Status = ""

        if (Position === "reset-filter") {
            setFilter("")
            setSearch("")
            setFilterStatus("")
        } else {
            if (Filter !== "") {
                if (Filter === "name") {
                    SearchNama = Search
                }
            }

            if (FilterStatus !== "") {
                if (FilterStatus === "tidak-aktif") {
                    Status = "0"
                } else  {
                    Status = "1"
                }
            }
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UserName": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "SELECT",
            "Page": Page,
            "RowPage": 20,
            "OrderBy": "tgl_input",
            "Order": "DESC"
        });

		var url = paths.URL_API_ADMIN + 'MasterItem';
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
				setListSiswa(data.Result)
                setTotalData(data.TotalData)
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

    const updateStatusUser = (IdUserlogin, Status) => {

        var vStatus = ""
        if (Status === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        if (IdUserlogin === 0) {
            setErrorMessageAlert("IdUserlogin tidak boleh kosong");
            setShowAlert(true);
            return false;
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
			"UsernameSession": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "UPDATE",
            "Id": IdUserlogin,
            "Status": vStatus
		});

		var url = paths.URL_API_ADMIN + 'UserLogin';
		var Signature  = generateSignature(requestBody)

		setLoadingStatus(true)

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
			setLoadingStatus(false)

			if (data.ErrorCode === "0") {
				// getListItem(1, "")
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
			setLoadingStatus(false)
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

    const handleChangeStatus = (Id, Status) => {
        var vListUsesr = ListSiswa

        var vStatus = ""
        if (Status === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        vListUsesr.map((item,index) => {
            if (item.Id === Id) {
                vListUsesr[index].Status = vStatus
                updateStatusUser(Id, Status)
            }
        })
        getListItem(vListUsesr)
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

    const handlePageClick = (data) => {

        let currentPage = data.selected + 1
        setPaging(data.selected)
        setListSiswa([])
        getListItem(currentPage, "")
    }
    
    return (
		<div className="main-page" style={{ backgroundColor:'#F6FBFF' }}>
            <div className="content-wrapper-2" style={{ backgroundColor:'#F6FBFF', width:'100%' }} >
                <div className="blog-post">
                    <div style={{ fontWeight:'bold', color:'#004372', fontSize:30 }}><FontAwesomeIcon icon={faGraduationCap}/> Master Data Item</div>
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
                            history.replace("/overview")
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
                    
                    <Gap height={20} />
                    
                    <div>
                        <a href='master-data'>
                            <button role="tab" aria-controls="merchant-list">
                                <div style={{ color:'#004372', fontSize:16, fontWeight:'bold' }}>Kelas 10</div>
                            </button>
                        </a>
                    </div>
                    
                    <div style={{ backgroundColor:'white', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20 }}>

                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <div style={{ display:'flex', justifyContent:'flex-start' }}>
                                <div style={{ border:'2px solid #004372', padding:5, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} onClick={() => getListItem(1, "")}>
                                    <FontAwesomeIcon icon={faArrowsRotate} style={{ height:10, width:30 }} />
                                </div>
                                <div style={{ paddingRight:10 }} />
                                <div 
                                    style={{ border:'2px solid #004372', padding:10, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} 
                                    onClick={() => setFilterPopup(!FilterPopup)}>
                                    <div style={{ fontWeight:'bold', fontSize:13 }}><FontAwesomeIcon icon={faFilter} /> Filter Data</div>
                                </div>
                            </div>
                            <div style={{ border:'2px solid #004372', padding:10, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} onClick={() => history.push('input-admin-access')}>
                                <div style={{ fontWeight:'bold', fontSize:13 }}><FontAwesomeIcon icon={faUserPlus} /> Tambah Siswa</div>
                            </div>
                        </div>

                        {FilterPopup &&
                        <div>
                            <div style={{ paddingBottom:20 }} />
                            <div style={{ borderRadius:10, backgroundColor:'#FFFFFF', paddingTop:25, paddingLeft:25, paddingRight:25, position:'absolute', zIndex:100, border:'.5px solid', height:300 }} >
                                <div style={{ color:'#004372', fontWeight:'bold', fontSize:13 }}>Sort By</div>
                                <div style={{ marginBottom:10 }}></div>
                                <Row style={{ alignItems:'center' }}>
                                    <Col xs={3} md={6} lg={6} style={{ paddingLeft:6 }}>
                                        <Dropdown
                                            onChange={(event) => setFilter(event.target.value) }>
                                            <option value="global">Select Filter</option>
                                            <option value="name" selected={Filter === "name"}>Name</option>
                                        </Dropdown>
                                    </Col>
                                    <Col xs={3} md={6} lg={6} style={{ paddingLeft:6 }}>
                                        <Input
                                            placeHolder="Input Search"
                                            value={Search}
                                            style={{ borderColor:'silver' }}
                                            onChange={event => setSearch(event.target.value)}
                                        />
                                    </Col>
                                </Row>

                                <hr></hr>
                            
                                <div style={{ marginBottom:10 }}></div>
                                <div style={{ color:'#004372', fontWeight:'bold', fontSize:13 }}>Status</div>
                                <div style={{ marginBottom:10 }}></div>

                                <Row>
                                    <Col xs={3} md={6} lg={6} style={{ paddingRight:6 }}>
                                        <Dropdown
                                            onChange={(event) => setFilterStatus(event.target.value) }>
                                            <option value="">Select Filter</option>
                                            <option value="aktif" selected={FilterStatus === "aktif"}>Aktif</option>
                                            <option value="tidak-aktif" selected={FilterStatus === "tidak-aktif"}>Tidak Aktif</option>
                                        </Dropdown>
                                    </Col>
                                </Row>

                                <div style={{ bottom:10, right:10, position:'absolute', display:'flex', alignItems:'center' }}>
                                    <div style={{ cursor:'pointer' }} onClick={() => {
                                        setFilterPopup(false)
                                        getListItem(1, "reset-filter")
                                        // setPaging(0)
                                    }}>Reset Filter</div>
                                    <div style={{ marginLeft:10 }}></div>
                                    <div style={{ backgroundColor:'#004372', width:100, height:30, borderRadius:10, color:'#FFFFFF', fontSize:13, cursor:'pointer', textAlign:'center' }}>
                                        <div style={{ marginTop:4, fontWeight:'bold' }} onClick={() => {
                                            getListItem(1, "")
                                            setFilterPopup(false)
                                            // setPaging(0)
                                            }}>Apply Now</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                        
                        <hr/>

                        <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                            <Thead>
                                <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                    <Th className="tabelHeader" style={{ paddingTop:20, paddingBottom:20 }}><LabelTH></LabelTH></Th>
                                    <Th className="tabelHeader"><LabelTH>Name</LabelTH></Th>
                                    <Th className="tabelHeader"><LabelTH>Username</LabelTH></Th>
                                    <Th className="tabelHeader"><LabelTH>Access</LabelTH></Th>
                                    <Th className="tabelHeader"><LabelTH>Tanggal Input</LabelTH></Th>
                                    <Th className="tabelHeader"><LabelTH>Action</LabelTH></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Loading ? 
                                <Tr>
                                    <td colSpan="6" align="center">
                                        <div className="loader-container">
                                            <div className="spinner" />
                                        </div>
                                    </td>
                                </Tr>
                                :
                                ListSiswa.length > 0 ? ListSiswa.map((item,index)=>{
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
                                        {LoadingStatus && item.Id === IdStatus ?
                                        <div className="loader-container-small">
                                            <div className="spinner-small" />
                                        </div>
                                        :
                                        <Td style={{ paddingTop:20, paddingBottom:20, color:'#546E7A', borderTopLeftRadius:10, borderBottomLeftRadius:10 }} onMouseOut={handleMouseOut}>
                                            <Form>
                                                <Form.Check
                                                    disabled={item.Username !== "admin_siam" ? false : true}
                                                    type="switch"
                                                    id={item.Id}
                                                    checked={item.Status === "0" ? false : true}
                                                    onChange={() => {
                                                        setIdStatus(item.Id)
                                                        handleChangeStatus(item.Id, item.Status) 
                                                    }}
                                                />
                                            </Form>
                                        </Td>
                                        }
                                        <td style={{ color:'#546E7A', paddingTop:20, paddingBottom:20 }} onMouseOut={handleMouseOut}>{item.Nama}</td>
                                        <td style={{ paddingTop:20, paddingBottom:20, color:item.Id === IdIndex && isHoveringNoEdit && item.Status !== 0 ? '#004372' : '#546E7A', textAlign:'left' }}>{item.Username}</td>
                                        <td style={{ textAlign:'left' }}>{item.Role}</td>                             
                                        <td style={{ textAlign:'left' }}>{item.TanggalInput}</td>
                                        <td>
                                            {item.Username !== "admin_siam" &&
                                            <FontAwesomeIcon icon={faUserPen} style={{ height:20, width:20, cursor:'pointer' }} onClick={() => {
                                                history.push('update-admin-access')
                                                setCookie('varUserId', item.Id)
                                            }}/>}
                                        </td>
                                    </Tr>;
                                }) : <Tr><td colSpan="6" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
                                }
                            </Tbody>
                        </Table>

                        <hr/>

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

export default MasterData;