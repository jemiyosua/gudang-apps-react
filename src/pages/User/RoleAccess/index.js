import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Header, Footer, Input, Button, Gap, Dropdown } from '../../../components';
import './User.css'
import { useDispatch } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import LabelTH from '../../../components/molecules/LabelTH'
import { Col, Row, Form, ListGroup, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faFileCirclePlus, faFilter, faUserPlus, faArrowLeft, faUserGear, faArrowsRotate, faUserPen } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPaginate from 'react-paginate';

const RoleAccess = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    // const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")
	const [Loading, setLoading] = useState(false)
	const [LoadingStatus, setLoadingStatus] = useState(false)
    const [IdIndex, setIdIndex] = useState("")
    const [isHovering, setIsHovering] = useState(false)
    const [isHoveringNoEdit, setIsHoveringNoEdit] = useState(false)

	const [ListRole, setListRole] = useState([])
    const [IdStatus, setIdStatus] = useState("")
    const [Filter, setFilter] = useState("")
    const [FilterPopup, setFilterPopup] = useState(false)
    const [Search, setSearch] = useState("")
    const [FilterStatus, setFilterStatus] = useState("")
    const [TotalData, setTotalData] = useState(0)
    const [TotalPages, setTotalPages] = useState(0)
    const [Paging, setPaging] = useState("")
	
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
        
        if (CookieParamKey == null || CookieParamKey === "" || CookieUsername == null || CookieUsername === "") {
            logout()
            window.location.href="admin/login";
            return false;
        } else {
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","User"))

            getListRole(1, "")
        }

    },[])

	const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie=="string") {
            var LongSecretCookie = SecretCookie.split("|");
            var UserName = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var Nama = LongSecretCookie[2];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)
        
            if (tipe === "username") {
                return UserName;            
            } else if (tipe === "paramkey") {
                return ParamKey;
            } else if (tipe === "nama") {
                return Nama;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    const handleMouseOver = (Id, idx, position) => {
        var IdIndex = idx.IdVoucher

        if (position == "edit") {
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

    const getListRole = (Page, Position) => {

        var SearchRoleName = ""
        var Status = ""

        if (Position === "reset-filter") {
            setFilter("")
            setSearch("")
            setFilterStatus("")
        } else {
            if (Filter !== "") {
                if (Filter === "role-name") {
                    SearchRoleName = Search
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
            "RoleName": SearchRoleName,
            "Status": Status,
			"Page": Page,
			"RowPage": 5,
			"OrderBy": "id",
			"Order": "ASC"
		});

		var url = paths.URL_API_ADMIN + 'Roles';
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
                setTotalData(data.TotalData)
                setTotalPages(data.TotalPage)
				setListRole(data.Result)
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

    const updateStatusRole = (RoleID, Status) => {

        var vStatus = ""
        if (Status === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        if (RoleID === 0) {
            setErrorMessageAlert("RoleID tidak boleh kosong");
            setShowAlert(true);
            return false;
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
			"Username": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "UPDATE",
            "RoleId": RoleID,
            "Status": vStatus
		});

        console.log(requestBody)

		var url = paths.URL_API_ADMIN + 'Roles';
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

			if (data.ErrCode === "0") {
				// getListRole(1, "")
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

    const handleChangeStatus = (RoleId, Status) => {
        var vListRole = ListRole

        var vStatus = ""
        if (Status === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        vListRole.map((item,index) => {
            if (item.RoleID === RoleId) {
                vListRole[index].Status = vStatus
                updateStatusRole(RoleId, Status)
            }
        })
        setListRole(vListRole)
    }

    const handlePageClick = (data) => {

        let currentPage = data.selected + 1
        setPaging(data.selected)
        setListRole([])
        getListRole(currentPage, "")
    }

	const logout = ()=>{
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
            
            <div style={{ backgroundColor:'white', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20 }}>

                
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', justifyContent:'flex-start' }}>
                        <div style={{ border:'2px solid #004372', padding:5, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} onClick={() => getListRole(1, "")}>
                            <FontAwesomeIcon icon={faArrowsRotate} style={{ height:10, width:30 }} />
                        </div>
                        <div style={{ paddingRight:10 }} />
                        <div 
                            style={{ border:'2px solid #004372', padding:10, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} 
                            onClick={() => setFilterPopup(!FilterPopup)}>
                            <div style={{ fontWeight:'bold', fontSize:13 }}><FontAwesomeIcon icon={faFilter} /> Filter Data</div>
                        </div>
                    </div>
                    <div style={{ border:'2px solid #004372', padding:10, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} onClick={() => history.push('/input-role-access')}>
                        <div style={{ fontWeight:'bold', fontSize:13 }}><FontAwesomeIcon icon={faUserGear} /> Add New Role</div>
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
                                    <option value="role-name" selected={Filter === "role-name"}>Role Name</option>
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

                        <hr/>
                    
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
                                getListRole(1, "reset-filter")
                                // setPaging(0)
                            }}>Reset Filter</div>
                            <div style={{ marginLeft:10 }}></div>
                            <div style={{ backgroundColor:'#004372', width:100, height:30, borderRadius:10, color:'#FFFFFF', fontSize:13, cursor:'pointer', textAlign:'center' }}>
                                <div style={{ marginTop:4, fontWeight:'bold' }} onClick={() => {
                                    getListRole(1, "")
                                    setFilterPopup(false)
                                    // setPaging(0)
                                    }}>Apply Now</div>
                            </div>
                        </div>
                    </div>
                </div>
                }
                
                <hr/>

                <Table striped bordered hover responsive cellspacing="0" cellpadding="7" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                    <Thead>
                        <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                            <Th className="tabelHeader" style={{ paddingTop:20, paddingBottom:20 }}><LabelTH></LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Role Name</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Tanggal Input</LabelTH></Th>
                            <Th className="tabelHeader"><LabelTH>Action</LabelTH></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {Loading ? 
                        <Tr>
                            <Td colSpan="5" align="center">
                                <div className="loader-container">
                                    <div className="spinner"></div>
                                </div>
                            </Td>
                        </Tr>
                        :
                        ListRole.length > 0 ? ListRole.map((item,index)=>{
                        return <Tr style={{
                            marginBottom:20,
                            backgroundColor:item.Status === "0" ? '#EEEEEE' : 'white',
                            borderTopWidth:1,
                            borderTop:'2px solid #546E7A',
                            borderBottom:item.RoleID === IdIndex && isHoveringNoEdit ? "2px solid #546E7A" : "white",
                            borderTopColor:item.RoleID === IdIndex && isHoveringNoEdit ? "#546E7A" : "white",
                            borderLeftColor:item.RoleID === IdIndex && isHoveringNoEdit ? "#546E7A" : "white",
                            borderLeftWidth:1,
                            borderLeft:item.RoleID === IdIndex && isHoveringNoEdit ? '2px solid #546E7A' : '2px solid white',
                            borderRightColor:item.RoleID === IdIndex && isHoveringNoEdit ? "#546E7A" : "white",
                            borderRightWidth:1,
                            borderRight:item.RoleID === IdIndex && isHoveringNoEdit ? '2px solid #546E7A' : '2px solid white',
                            textAlign:'left'
                        }} onMouseOver={() => handleMouseOver(item.RoleID, item, "no-edit")} onMouseOut={handleMouseOut}>
                                {LoadingStatus && item.RoleID === IdStatus ?
                                <div className="loader-container-small">
                                    <div className="spinner-small"></div>
                                </div>
                                :
                                item.Username !== "admin_siam" ?
                                <td style={{ paddingTop:20, paddingBottom:20, color:'#546E7A', opacity:item.Status === 0 ? .4 : 1, borderTopLeftRadius:10, borderBottomLeftRadius:10 }} onMouseOut={handleMouseOut}>
                                    <Form>
                                        <Form.Check 
                                            type="switch"
                                            id={item.RoleID}
                                            checked={item.Status === "0" ? false : true}
                                            onChange={() => {
                                                setIdStatus(item.RoleID)
                                                handleChangeStatus(item.RoleID, item.Status) 
                                            }}
                                        />
                                    </Form>
                                </td>
                                :<div></div>
                                }
                                <td style={{color:'#546E7A', paddingTop:20, paddingBottom:20, opacity:item.Status === 0 ? .4 : 1}} onMouseOut={handleMouseOut}>{item.RoleName}</td>                    
                                <td style={{ textAlign:'left', opacity:item.Status === 0 ? .4 : 1 }}>{item.TanggalInput}</td>
                                <td>
                                    {item.Username !== "admin_siam" &&
                                    <FontAwesomeIcon icon={faUserPen} style={{ height:20, width:20, cursor:'pointer' }} onClick={() => {
                                        history.push('update-role-access')
                                        setCookie('varRoleId', item.RoleID)
                                    }}/>}
                                </td>
                            </Tr>;
                        }) : <Tr><td colSpan="4" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
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
    )
}

export default RoleAccess;