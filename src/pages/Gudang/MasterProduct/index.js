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
import { FaPenSquare, FaTrash } from 'react-icons/fa';
import { Markup } from 'interweave'
import ImportProduct from '../MasterProduct/ImportProduct'
import ScanProduct from '../MasterProduct/ScanProduct'
import { IconActive, IconAddNewProduct, IconEye, IconImportProduct, IconRefresh, IconScanProduct, IconTrash, IconUnactive, IconUpdateProduct } from '../../../assets';

const MasterProduct = () => {
    const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);

	const [cookies, setCookie,removeCookie] = useCookies(['user']);
	const [Name, setName] = useState("")
	const [Loading, setLoading] = useState(false)
	const [LoadingStatus, setLoadingStatus] = useState(false)
    const [LoadingStok, setLoadingStok] = useState(false)
    const [IdIndex, setIdIndex] = useState("")
    const [isHovering, setIsHovering] = useState(false)
    const [isHoveringNoEdit, setIsHoveringNoEdit] = useState(false)

	const [ListProduk, setListProduk] = useState([])
	const [ListProdukUpdate, setListProdukUpdate] = useState([])
	const [ListKategoriProduk, setListKategoriProduk] = useState([])
    const [ListProdukPrice, setListProdukPrice] = useState([])
    const [IdStatus, setIdStatus] = useState("")
    const [ProdukId, setProdukId] = useState("")
    const [NamaProduk, setNamaProduk] = useState("")
    const [KategoriProduk, setKategoriProduk] = useState("")
    const [UserInput, setUserInput] = useState("")
    const [Status, setStatus] = useState("")
    const [ModalUpdate, setModalUpdate] = useState("")
    const [ModalAddNewProduct, setModalAddNewProduct] = useState(false)
    const [PageImport, setPageImport] = useState(false)
    const [PageScan, setPageScan] = useState(false)

    const [IdProdukModalUpdate, setIdProdukModalUpdate] = useState("")
    const [NamaProdukModalUpdate, setNamaProdukModalUpdate] = useState("")
    const [KategoriProdukModalUpdate, setKategoriProdukModalUpdate] = useState("")

    const [IdProdukDelete, setIdProdukDelete] = useState("")

    const [TotalData, setTotalData] = useState(0)
    const [TotalPages, setTotalPages] = useState(0)
    const [Paging, setPaging] = useState("")
    const [RoleAccess, setRoleAccess] = useState("")
    const [TotalProdukPrice, setTotalProdukPrice] = useState(0)
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
    const [ValidationMessage, setValidationMessage] = useState("")
    const [ConfirmMessage, setConfirmMessage] = useState("")

    const [ProductIdAddNew, setProductIdAddNew] = useState("")
    const [ProductNameAddNew, setProductNameAddNew] = useState("")
    const [CategoryAddNew, setCategoryAddNew] = useState("")
    const [SellingPriceAddNew, setSellingPriceAddNew] = useState("")
    const [BuyingPriceAddNew, setBuyingPriceAddNew] = useState("")
    const [UnitAddNew, setUnitAddNew] = useState("")
    const [QuantityAddNew, setQuantityAddNew] = useState("")
    const [AmountAddNew, setAmountAddNew] = useState("")
    const [ExpiredDateAddNew, setExpiredDateAddNew] = useState("")

    const [AlertProductID, setAlertProductID] = useState(false)
    const [AlertProductName, setAlertProductName] = useState(false)
    const [AlertCategory, setAlertCategory] = useState(false)
    const [AlertSellingPrice, setAlertSellingPrice] = useState(false)
    const [AlertBuyingPrice, setAlertBuyingPrice] = useState(false)
    const [AlertUnit, setAlertUnit] = useState(false)
    const [AlertQuantity, setAlertQuantity] = useState(false)
    const [AlertAmount, setAlertAmount] = useState(false)
    const [AlertExpiredDate, setAlertExpiredDate] = useState(false)

    const [ModalStokProduk, setModalStokProduk] = useState("")
    const [NamaProdukStok, setNamaProdukStok] = useState("")


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

        if (getCookie("page_return") === "ScanProduct" || getCookie("page_return") === "ImportProduct") {
            setPageImport(false)
            setPageScan(false)
        }

        dispatch(setForm("PageReturn",''))
        
        if (CookieParamKey == null || CookieParamKey === "" || CookieUsername == null || CookieUsername === "") {
            logout()
            window.location.href="admin/login";
            return false;
        } else {
            dispatch(setForm("ParamKey",CookieParamKey))
            dispatch(setForm("Username",CookieUsername))
            dispatch(setForm("PageActive","Gudang"))

            getListKategoriProduk()
            getListProduk(1, "", "", "")
        }

    },[])

	const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        var PageReturn = cookies.PageReturn;
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
            } else if (tipe === "page_return") {
                return PageReturn
            } else {
                return null
            }
        } else {
            return null
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

    // { ---------- start curl ----------
    const getListProduk = (Page, Position, SearchValue, SearchType) => {

        setShowAlert(false)

        var SearchProdukId = ""
        var SearchNamaProduk = ""
        var SearchKategoriProduk = ""
        var SearchUserInputProduk = ""
        var Status = ""

        if (Position === "reset-filter") {
            // setFilter("")
            // setSearch("")
            // setFilterStatus("")
        } else {
            if (SearchType !== "") {
                if (SearchType === "produk_id") {
                    SearchProdukId = SearchValue
                } else if (SearchType === "nama_produk") {
                    SearchNamaProduk = SearchValue
                } else if (SearchType === "kategori_produk") {
                    setKategoriProduk(SearchValue)
                    SearchKategoriProduk = SearchValue
                } else if (SearchType === "user_input") {
                    SearchUserInputProduk = SearchValue
                } else if (SearchType === "status") {
                    setStatus(SearchValue)
                    Status = SearchValue
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
            "UserInput": SearchUserInputProduk,
            "Status": Status,
            "Page": Page,
            "RowPage": 20,
            "OrderBy": "dbmp.tgl_input",
            "Order": "DESC"
        });

		var url = paths.URL_API_ADMIN + 'MasterProduk';
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

    const updateStatusProduk = (IdProduk, Status) => {

        var vStatus = ""
        if (Status === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        if (IdProduk === 0) {
            setErrorMessageAlert("Id Produk tidak boleh kosong");
            setShowAlert(true);
            return false;
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
			"Username": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "UPDATE",
            "ProdukId": IdProduk,
            "Status": vStatus
		});

		var url = paths.URL_API_ADMIN + 'MasterProduk';
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

    const updateDetailProduk = () => {

        var errmsg = ""

        if (NamaProdukModalUpdate === "") {
            errmsg += "- Nama Produk tidak boleh kosong \n"
        }

        if (NamaProdukModalUpdate === "") {
            errmsg += "- Kategori Produk tidak boleh kosong \n"
        }

        if (errmsg !== ""){
            setValidationMessage(errmsg)
            setShowAlert(true)
            return
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
			"Username": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "UPDATE",
            "ProdukId": IdProdukModalUpdate,
            "NamaProduk": NamaProdukModalUpdate,
            "KategoriIdProduk": KategoriProdukModalUpdate
		});

		var url = paths.URL_API_ADMIN + 'MasterProduk';
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
				getListProduk(1, "")
                setSuccessMessage("Berhasil update data")
                setShowAlert(true)
                setModalUpdate(false)
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

    const deleteProduk = () => {

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
			"Username": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "DELETE",
            "ProdukId": IdProdukDelete,
		});

		var url = paths.URL_API_ADMIN + 'MasterProduk';
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
                setConfirmMessage("")
                setSuccessMessage("Berhasil delete data")
                setShowAlert(true)
                getListProduk(1, "")
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

    const insertAddNewProduct = () => {

        var AlertAll = false
        if (ProductIdAddNew === "") {
            AlertAll = true
            setAlertProductID(true)
        }

        if (ProductNameAddNew === "") {
            AlertAll = true
            setAlertProductName(true)
        }

        if (CategoryAddNew === "") {
            AlertAll = true
            setAlertCategory(true)
        }

        if (SellingPriceAddNew === "") {
            AlertAll = true
            setAlertSellingPrice(true)
        }

        if (BuyingPriceAddNew === "") {
            AlertAll = true
            setAlertBuyingPrice(true)
        }

        if (QuantityAddNew === "") {
            AlertAll = true
            setAlertQuantity(true)
        }

        if (AmountAddNew === "") {
            AlertAll = true
            setAlertAmount(true)
        }

        if (AlertAll) {
            return
        }

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

        const SellingPriceAddNewReplace = SellingPriceAddNew.replaceAll(',', '');
        const BuyingPriceAddNewReplace = BuyingPriceAddNew.replaceAll(',', '');

		var requestBody = JSON.stringify({
			"Username": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "INSERT",
            "ProdukId": ProductIdAddNew,
            "NamaProduk": ProductNameAddNew,
            "KategoriIdProduk": CategoryAddNew,
            "HargaJualProduk": parseInt(SellingPriceAddNewReplace),
            "HargaBeliProduk": parseInt(BuyingPriceAddNewReplace),
            "QtyProduk": parseInt(QuantityAddNew),
            "UserInput": CookieUsername
		});

		var url = paths.URL_API_ADMIN + 'MasterProdukEach';
		var Signature  = generateSignature(requestBody)

		// setLoadingStatus(true)

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
			// setLoadingStatus(false)

			if (data.ErrorCode === "0") {
                setModalAddNewProduct(false)
                getListProduk(1, "", "", "")
                setAlertProductID(false)
                setAlertProductName(false)
                setAlertCategory(false)
                setAlertSellingPrice(false)
                setAlertBuyingPrice(false)
                setAlertUnit(false)
                setAlertQuantity(false)
                setAlertAmount(false)
                setAlertExpiredDate(false)
                setModalAddNewProduct(false)
                setProductIdAddNew("")
                setProductNameAddNew("")
                setCategoryAddNew("")
                setSellingPriceAddNew("")
                setBuyingPriceAddNew("")
                setQuantityAddNew("")
                setAmountAddNew("")
                setSuccessMessage("Success Insert Data")
                setShowAlert(true)
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
			// setLoadingStatus(false)
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

    const getListProdukPrice = (ProdukId) => {

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		var requestBody = JSON.stringify({
            "UserName": CookieUsername,
            "ParamKey": CookieParamKey,
            "Method": "SELECT",
            "KodeProduk": ProdukId,
            "Page": 1,
            "RowPage": -1,
            "OrderBy": "",
            "Order": ""
        });

		var url = paths.URL_API_ADMIN + 'ProductPrice';
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
				setListProdukPrice(data.Result)
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
// } ---------- end of curl ----------

    const handleChangeStatus = (Id, Status) => {
        var vListProduk = ListProduk

        var vStatus = ""
        if (Status === "0") {
            vStatus = "1"
        } else {
            vStatus = "0"
        }

        vListProduk.map((item,index) => {
            if (item.ProdukId === Id) {
                vListProduk[index].Status = vStatus
                updateStatusProduk(Id, Status)
            }
        })
        setListProduk(vListProduk)
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
            <div className="content-wrapper-2" style={{ width:'100%' }} >
                <div className="blog-post">
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
                        onConfirm={() => deleteProduk()}
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

                        {PageImport ?
                        <>
                            <div style={{ backgroundColor:'#FFFFFF', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20, paddingTop:30 }}>
                                <div style={{ color:'#004372', cursor:'pointer' }} onClick={() => setPageImport(false)}><FontAwesomeIcon icon={faArrowLeft} /> Back</div>
                            </div>
                            <ImportProduct />
                        </>
                        : PageScan ?
                        <>
                            <div style={{ backgroundColor:'#FFFFFF', height:'auto', width:'100%', borderBottomLeftRadius:25, borderBottomRightRadius:25, borderTopRightRadius:25, padding:20, paddingTop:30 }}>
                                <div style={{ color:'#004372', cursor:'pointer' }} onClick={() => setPageScan(false)}><FontAwesomeIcon icon={faArrowLeft} /> Back</div>
                            </div>
                            <ScanProduct />
                        </>
                        :
                        <>
                            <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
                                <div
                                    style={{ cursor:'pointer' }}
                                    onClick={() => {
                                        setStatus("")
                                        setProdukId("")
                                        setNamaProduk("")
                                        setKategoriProduk("")
                                        setUserInput("")
                                        getListProduk(1, "", "", "")
                                    }}>
                                    <img src={IconRefresh} />
                                </div>
                                <div style={{  marginLeft:20  }} />
                                <div
                                    style={{ cursor:'pointer' }}
                                    onClick={() => {
                                        setModalAddNewProduct(true)
                                    }}>
                                    <img style={{ width:25 }} src={IconAddNewProduct} />
                                </div>
                                <div style={{  marginLeft:20  }} />
                                <div
                                    style={{ cursor:'pointer' }}
                                    onClick={() => {
                                        setPageScan(true)
                                        setPageImport(false)
                                    }}>
                                    <img style={{ width:25 }} src={IconScanProduct} />
                                </div>
                                <div style={{  marginLeft:20  }} />
                                <div
                                    style={{ cursor:'pointer' }}
                                    onClick={() => {
                                        setPageScan(false)
                                        setPageImport(true)
                                    }}>
                                    <img style={{ width:25 }} src={IconImportProduct} />
                                </div>
                                {/* <div style={{ display:'flex', alignItems:'center' }}>
                                    <div style={{ border:'2px solid #004372', padding:10, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} onClick={() => {
                                        setPageScan(true)
                                        setPageImport(false)
                                    }}>
                                        <div style={{ fontWeight:'bold', fontSize:13 }}><FontAwesomeIcon icon={faBarcode} /> Scan Product</div>
                                    </div>
                                    <div style={{  marginLeft:10  }} />
                                    <div style={{ border:'2px solid #004372', padding:10, borderWidth:1, width:'auto', height:'auto', borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15, cursor:'pointer' }} onClick={() => {
                                        setPageScan(false)
                                        setPageImport(true)
                                    }}>
                                        <div style={{ fontWeight:'bold', fontSize:13 }}><FontAwesomeIcon icon={faFileImport} /> Import Product</div>
                                    </div>
                                </div> */}
                                
                            </div>
                        
                            <br />
                            <br />

                            <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                                <Thead>
                                    <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                        <Th className="tabelHeader" style={{ paddingTop:20, paddingBottom:20 }}>
                                            <Dropdown onChange={(event) => getListProduk(1, "", event.target.value, "status") }>
                                                <option value="">Status</option>
                                                <option value="1" selected={Status === "1"}>Aktif</option>
                                                <option value="0" selected={Status === "0"}>Tidak Aktif</option>
                                            </Dropdown>
                                        </Th>
                                        <Th className="tabelHeader">
                                            <Input
                                                required
                                                value={ProdukId}
                                                onChange={event => setProdukId(event.target.value)}
                                                onKeyDown={event => {
                                                    if (event.key === 'Enter') {
                                                        getListProduk(1, "", event.target.value, "produk_id")
                                                        event.target.blur()
                                                    }
                                                }}
                                                placeHolder={'Produk ID'}
                                            />
                                        </Th>
                                        <Th className="tabelHeader">
                                            <Input
                                                required
                                                value={NamaProduk}
                                                onChange={event => setNamaProduk(event.target.value)}
                                                onKeyDown={event => {
                                                    if (event.key === 'Enter') {
                                                        getListProduk(1, "", event.target.value, "nama_produk")
                                                        event.target.blur()
                                                    }
                                                }}
                                                onFocus={() => setNamaProduk("")}
                                                placeHolder={'Produk Name'}
                                            />
                                        </Th>
                                        <Th className="tabelHeader">Selling Price</Th>
                                        <Th className="tabelHeader">Quantity</Th>
                                        <Th className="tabelHeader">
                                            <Dropdown onChange={event => {
                                                getListProduk(1, "", event.target.value, "kategori_produk")
                                                setKategoriProduk(event.target.value)
                                            }}>
                                            <option value="">Category</option>
                                            {ListKategoriProduk.length > 0 && ListKategoriProduk.map((item,index) => {
                                                return <option value={item.Id}>{item.NamaKategori}</option>
                                            })}
                                            </Dropdown>
                                        </Th>
                                        <Th className="tabelHeader">
                                            <Input
                                                required
                                                value={UserInput}
                                                onChange={event => setUserInput(event.target.value)}
                                                onKeyDown={event => {
                                                    if (event.key === 'Enter') {
                                                        getListProduk(1, "", event.target.value, "user_input")
                                                        event.target.blur()
                                                    }
                                                }}
                                                placeHolder={'User Input'}
                                            />
                                        </Th>
                                        <Th className="tabelHeader">Update Date</Th>
                                        <Th className="tabelHeader">Input Date</Th>
                                        <Th className="tabelHeader" colSpan={3}>Action</Th>
                                    </Tr>
                                </Thead>
                                {/* <Thead>
                                    <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                        <Th className="tabelHeader" style={{ paddingTop:20, paddingBottom:20 }}><LabelTH>Status</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Produk Id</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Nama Produk</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Kategori Produk</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>User Input</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Tanggal Update</LabelTH></Th>
                                        <Th className="tabelHeader"><LabelTH>Tanggal Input</LabelTH></Th>
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
                                    ListProduk.length > 0 ? ListProduk.map((item,index)=>{
                                    return <Tr style={{
                                        marginBottom:20,
                                        borderBottomWidth:1,
                                        borderBottom:'1px solid #004372',
                                        borderLeftWidth:1,
                                        borderRightWidth:1,
                                    }}>
                                            {LoadingStatus && item.ProdukId === IdStatus ?
                                            <div className="loader-container-small">
                                                <div className="spinner-small" />
                                            </div>
                                            :
                                            <td style={{ paddingTop:20, paddingBottom:20, color:'#546E7A', borderTopLeftRadius:10, borderBottomLeftRadius:10, textAlign:'center' }}>
                                                {item.Status === "0" ? 
                                                <img 
                                                    src={IconUnactive}
                                                    style={{ width:30, height:30, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setIdStatus(item.ProdukId)
                                                        handleChangeStatus(item.ProdukId, item.Status)
                                                    }}
                                                />
                                                :
                                                <img 
                                                    src={IconActive}
                                                    style={{ width:30, height:30, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setIdStatus(item.ProdukId)
                                                        handleChangeStatus(item.ProdukId, item.Status)
                                                    }}
                                                />
                                                }
                                                {/* <Form>
                                                    <Form.Check
                                                        disabled={item.UsernameLogin !== "admin_gudang" ? false : true}
                                                        type="switch"
                                                        id={item.Id}
                                                        checked={item.Status === "0" ? false : true}
                                                        onChange={() => {
                                                            setIdStatus(item.ProdukId)
                                                            handleChangeStatus(item.ProdukId, item.Status)
                                                        }}
                                                    />
                                                </Form> */}
                                            </td>
                                            }
                                            <td style={{ paddingTop:20, paddingBottom:20, textAlign:'center' }}>{item.ProdukId}</td>
                                            <td style={{ color:'#004175', paddingTop:20, paddingBottom:20 }}>{item.NamaProduk}</td>
                                            <td style={{ color:'#004175', paddingTop:20, paddingBottom:20, fontWeight:'bold' }}>{'Rp. ' + FormatNumberBy3(item.HargaJual)}</td>
                                            <td style={{ color:'#004175', paddingTop:20, paddingBottom:20, textAlign:'center' }}>{item.Quantity}</td>
                                            <td style={{ paddingTop:20, paddingBottom:20 }}>{item.KategoriNamaProduk === "" ? "-" : item.KategoriNamaProduk}</td>
                                            <td style={{ paddingTop:20, paddingBottom:20 }}>{item.UserInput}</td>
                                            <td style={{ paddingTop:20, paddingBottom:20 }}>{item.TanggalUpdate}</td>
                                            <td style={{ paddingTop:20, paddingBottom:20 }}>{item.TanggalInput}</td>
                                            <td>
                                                <img 
                                                    src={IconEye}
                                                    style={{ height:20, width:20, cursor:'pointer' }} 
                                                    onClick={() => {
                                                        getListProdukPrice(item.ProdukId)
                                                        setNamaProdukStok(item.NamaProduk)
                                                        setModalStokProduk(true)
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <img 
                                                    src={IconUpdateProduct}
                                                    style={{ height:20, width:20, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setIdProdukModalUpdate(item.ProdukId)
                                                        setNamaProdukModalUpdate(item.NamaProduk)
                                                        setKategoriProdukModalUpdate(item.KategoriIdProduk)
                                                        setModalUpdate(true)
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <img 
                                                    src={IconTrash}
                                                    style={{ height:20, width:20, cursor:'pointer' }}
                                                    onClick={() => {
                                                        setIdProdukDelete(item.ProdukId)
                                                        setShowAlert(true)
                                                        setConfirmMessage("Are you sure want to delete " + item.NamaProduk + "?")
                                                    }}
                                                />
                                            </td>
                                        </Tr>;
                                    }) : <Tr><td colSpan="9" align="center" style={{ color:'red' }}>{"Data tidak ditemukan"}</td></Tr>
                                    }
                                </Tbody>
                            </Table>

                            <br/>

                            <Modal
                                show={ModalAddNewProduct}
                                size="lg"
                                aria-labelledby="contained-modal-title-vcenter"
                                centered
                                // style={{ backgroundColor: '#FFFFFF', opacity: .5 }}
                            >
                                <Modal.Body>
                                    <h3 style={{  color:'#004372', fontWeight:'bold'  }}>INSERT PRODUCT</h3>
                                    <br/>

                                    <Row>
                                        <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                                            <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Product ID</div>
                                            <div style={{ marginBottom:5 }}>
                                                <Input
                                                    required
                                                    pattern="[0-9]*"
                                                    value={ProductIdAddNew}
                                                    onChange={event => setProductIdAddNew(event.target.value.replace(/\D/g, ''))}
                                                    onFocus={() => setAlertProductID(false)}
                                                />
                                            </div>
                                            {AlertProductID && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Product ID cannot null</div>}
                                        </Col>
                                        <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                                            <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Product Name</div>
                                            <div style={{ marginBottom:5 }}>
                                                <Input
                                                    required
                                                    value={ProductNameAddNew}
                                                    onChange={event => setProductNameAddNew(event.target.value)}
                                                    onFocus={() => setAlertProductName(false)}
                                                />
                                            </div>
                                            {AlertProductName && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Product Name cannot null</div>}
                                        </Col>
                                        <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                                            <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Category</div>
                                            <div style={{ marginBottom:5 }}>
                                                <Dropdown onChange={event => {
                                                    setCategoryAddNew(event.target.value)
                                                    setAlertCategory(false)
                                                }}>
                                                    <option value="">Choose Category</option>
                                                    {ListKategoriProduk.length > 0 && ListKategoriProduk.map((item,index) => {
                                                        return <option value={item.Id}>{item.NamaKategori}</option>
                                                    })}
                                                </Dropdown>
                                            </div>
                                            {AlertCategory && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Category cannot null</div>}
                                        </Col>
                                    </Row>

                                    <Gap height={20} />

                                    <Row>
                                        <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                                            <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Selling Price</div>
                                            <div style={{ marginBottom:5 }}>
                                                <Input
                                                    required
                                                    value={SellingPriceAddNew}
                                                    onChange={event => setSellingPriceAddNew((Number(event.target.value.replace(/\D/g, '')) || '').toLocaleString())}
                                                    onFocus={() => setAlertSellingPrice(false)}
                                                />
                                            </div>
                                            {AlertSellingPrice && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Selling Price cannot null</div>}
                                        </Col>
                                        <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                                            <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Buying Price</div>
                                            <div style={{ marginBottom:5 }}>
                                                <Input
                                                    required
                                                    value={BuyingPriceAddNew}
                                                    onChange={event => setBuyingPriceAddNew((Number(event.target.value.replace(/\D/g, '')) || '').toLocaleString())}
                                                />
                                            </div>
                                            {AlertBuyingPrice && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Buying Price cannot null</div>}
                                        </Col>
                                        <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                                            <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Quantity</div>
                                            <div style={{ marginBottom:5 }}>
                                                <Input
                                                    required
                                                    value={QuantityAddNew}
                                                    onChange={event => setQuantityAddNew(event.target.value.replace(/\D/g, ''))}
                                                    onFocus={() => setAlertQuantity(false)}
                                                />
                                            </div>
                                            {AlertQuantity && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Quantity cannot null</div>}
                                        </Col>
                                        {/* <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                                            <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Unit</div>
                                            <div style={{ marginBottom:5 }}>
                                                <Dropdown onChange={event => {
                                                    setAlertAmount(false)
                                                    setUnitAddNew(event.target.value)
                                                }}>
                                                    <option value="">Choose Unit</option>
                                                    <option value="pcs">Pcs</option>
                                                    <option value="pack">Pack</option>
                                                </Dropdown>
                                            </div>
                                            {AlertUnit && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Unit cannot null</div>}
                                        </Col> */}
                                    </Row>

                                    <Gap height={20} />

                                    <Row>
                                        {/* <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                                            <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Quantity</div>
                                            <div style={{ marginBottom:5 }}>
                                                <Input
                                                    required
                                                    value={QuantityAddNew}
                                                    onChange={event => setQuantityAddNew(event.target.value.replace(/\D/g, ''))}
                                                    onFocus={() => setAlertQuantity(false)}
                                                />
                                            </div>
                                            {AlertQuantity && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Quantity cannot null</div>}
                                        </Col> */}
                                        {/* <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                                            <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Amount</div>
                                            <div style={{ marginBottom:5 }}>
                                                <Input
                                                    required
                                                    value={AmountAddNew}
                                                    onChange={event => setAmountAddNew(event.target.value.replace(/\D/g, ''))}
                                                    onFocus={() => setAlertAmount(false)}
                                                />
                                            </div>
                                            {AlertAmount && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Amount cannot null</div>}
                                        </Col> */}
                                        {/* <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                                            <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Expired Date</div>
                                            <div style={{ marginBottom:5 }}>
                                                <Form.Control
                                                    type="date"
                                                    onChange={event => setExpiredDateAddNew(event.target.value)}
                                                    onFocus={() => setAlertExpiredDate(false)}
                                                />
                                            </div>
                                            {AlertAmount && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Expired Date cannot null</div>}
                                        </Col> */}
                                    </Row>

                                </Modal.Body>

                                <Gap height={20} />
                                
                                <div style={{ display:'flex', justifyContent:'flex-end', padding:15, alignItems:'center' }}>
                                    <div style={{ color:'#B4C1C8', marginRight:20, fontSize:20, cursor:'pointer' }} onClick={() => {
                                        setAlertProductID(false)
                                        setAlertProductName(false)
                                        setAlertCategory(false)
                                        setAlertSellingPrice(false)
                                        setAlertBuyingPrice(false)
                                        setAlertUnit(false)
                                        setAlertQuantity(false)
                                        setAlertAmount(false)
                                        setAlertExpiredDate(false)
                                        setModalAddNewProduct(false)
                                    }}>Cancel</div>
                                    <div style={{ backgroundColor:'#004372', borderTopLeftRadius:8, borderTopRightRadius:8, borderBottomLeftRadius:8, borderBottomRightRadius:8, padding:10, width:150 }}>
                                        <div 
                                            style={{ color:'#FFFFFF', textAlign:'center', fontWeight:'bold', cursor:'pointer' }} 
                                            onClick={() => insertAddNewProduct()}
                                        >SAVE</div>
                                    </div>
                                </div>
                            </Modal>

                            <Modal
                                show={ModalUpdate}
                                size="lg"
                                aria-labelledby="contained-modal-title-vcenter"
                                centered
                                // style={{ backgroundColor: '#FFFFFF', opacity: .5 }}
                            >
                                {/* <Modal.Header closeButton>
                                    <Modal.Title id="contained-modal-title-vcenter">
                                    
                                    </Modal.Title>
                                </Modal.Header> */}
                                <Modal.Body>
                                    <h3 style={{  color:'#004372', fontWeight:'bold'  }}>MASTER PRODUCT</h3>
                                    <h5 style={{  color:'#004372'  }}>Update Details</h5>
                                    <br/>
                                    <div>
                                        <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Product Name</div>
                                        <div>
                                            <Input
                                                required
                                                value={NamaProdukModalUpdate}
                                                onChange={event => setNamaProdukModalUpdate(event.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Gap height={20} />

                                    <div>
                                        <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Category</div>
                                        <div>
                                            <Dropdown onChange={event => setKategoriProdukModalUpdate(event.target.value)}>
                                                <option value="">Pilih Kategori</option>
                                                {ListKategoriProduk.length > 0 && ListKategoriProduk.map((item,index) => {
                                                    return <option value={item.Id} selected={item.Id === KategoriProdukModalUpdate}>{item.NamaKategori}</option>
                                                })}
                                            </Dropdown>
                                        </div>
                                    </div>

                                </Modal.Body>

                                <Gap height={20} />
                                
                                <div style={{ display:'flex', justifyContent:'flex-end', padding:15, alignItems:'center' }}>
                                    <div style={{ color:'#B4C1C8', marginRight:20, fontSize:20, cursor:'pointer' }} onClick={() => setModalUpdate(false)}>Cancel</div>
                                    <div style={{ backgroundColor:'#004372', borderTopLeftRadius:8, borderTopRightRadius:8, borderBottomLeftRadius:8, borderBottomRightRadius:8, padding:10, width:150 }}>
                                        <div 
                                            style={{ color:'#FFFFFF', textAlign:'center', fontWeight:'bold', cursor:'pointer' }} 
                                            onClick={() => updateDetailProduk()}
                                        >SAVE</div>
                                    </div>
                                </div>
                            </Modal>

                            <Modal
                                show={ModalStokProduk}
                                size="lg"
                                aria-labelledby="contained-modal-title-vcenter"
                                centered
                                style={{ borderRadius:10}}
                            >
                            <Modal.Body>
                                <Gap height={20} />

                                <h3>{NamaProdukStok}</h3>

                                <br />

                                <Table striped bordered hover responsive cellspacing="0" cellpadding="10" style={{ fontSize:13, borderColor:'white', width:'100%' }}>
                                    <Thead>
                                        <Tr style={{color:"#004372", borderColor:'white', textAlign:'left'}}>
                                            <Th className="tabelHeader"><LabelTH>Product ID</LabelTH></Th>
                                            <Th className="tabelHeader"><LabelTH>Buying Price</LabelTH></Th>
                                            <Th className="tabelHeader"><LabelTH>Selling Price</LabelTH></Th>
                                            <Th className="tabelHeader"><LabelTH>Margin</LabelTH></Th>
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
                                        ListProdukPrice.length > 0 ? ListProdukPrice.map((item,index) => {
                                            return <Tr style={{
                                                marginBottom:20,
                                                borderBottomWidth:1,
                                                borderBottom:'1px solid #004372',
                                                borderLeftWidth:1,
                                                borderRightWidth:1,
                                                backgroundColor:index === 0 && '#004372'
                                            }}>
                                                <td style={{ color:index === 0 ? '#FFFFFF' : '#004372', paddingTop:20, paddingBottom:20, fontWeight:index === 0 && 'bold' }}>{item.KodeProduk}</td>
                                                <td style={{ color:index === 0 ? '#FFFFFF' : '#004372', paddingTop:20, paddingBottom:20, fontWeight:index === 0 && 'bold' }}>{'Rp. ' + FormatNumberBy3(item.HargaBeli)}</td>
                                                <td style={{ color:index === 0 ? '#FFFFFF' : '#004372', paddingTop:20, paddingBottom:20, fontWeight:index === 0 && 'bold' }}>{'Rp. ' + FormatNumberBy3(item.HargaJual)}</td>
                                                <td style={{ color:index === 0 ? '#FFFFFF' : '#004372', paddingTop:20, paddingBottom:20, fontWeight:index === 0 && 'bold' }}>{'Rp. ' + FormatNumberBy3(item.Margin)}</td>
                                            </Tr>;
                                            }) : <Tr><td colSpan="6" align="center" style={{ color:'red' }}>{"Data not found"}</td></Tr>
                                        }
                                    </Tbody>
                                </Table>

                            </Modal.Body>

                            <Gap height={20} />
                            
                            <div style={{ display:'flex', justifyContent:'flex-end', padding:15, alignItems:'center' }}>
                                <div style={{ backgroundColor:'#004372', borderTopLeftRadius:8, borderTopRightRadius:8, borderBottomLeftRadius:8, borderBottomRightRadius:8, padding:10, width:150 }}>
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
                        </>
                        }
                    </div>
                </div>
            </div>
		</div>
    )
}

export default MasterProduct;