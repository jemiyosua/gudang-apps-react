import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertMessage, paths } from '../../../utils'
import { historyConfig, generateSignature, fetchStatus } from '../../../utils/functions';
import { setForm } from '../../../redux';
import { NavLink } from 'react-router-dom';
import SweetAlert from 'react-bootstrap-sweetalert';
import './LeftMenu.css';
import { faCalendarDays, faChalkboardTeacher, faChalkboardUser, faChartPie, faGauge, faGear, faPerson, faSchool, faScrewdriver, faScrewdriverWrench, faScroll, faServer, faSignOutAlt, faStore, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { Sidebar, Menu, MenuItem, useProSidebar, SubMenu } from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { FaBalanceScale, FaBoxOpen, FaCashRegister, FaDollarSign, FaFileExport, FaFileInvoice, FaHome, FaLayerGroup, FaMoneyBill, FaMoneyBillWave, FaNewspaper, FaQrcode, FaWarehouse } from 'react-icons/fa';

const LeftMenu = () => {
	const history = useHistory(historyConfig);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
	const [cookies, setCookie, removeCookie] = useCookies(['user']);
	const [ListMenuSidebar, setListMenuSidebar] = useState([])
	const [Loading, setLoading] = useState(false)
	const { form }=useSelector(state=>state.PaketReducer);
	const { collapseSidebar } = useProSidebar();
	
	const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")

	useEffect(() => {
		window.scrollTo(0, 0)

		getListMenu()

	},[])

	const logout = ()=>{
        removeCookie('varCookie', { path: '/'})
        dispatch(setForm("ParamKey",''))
        dispatch(setForm("Username",''))
        dispatch(setForm("Name",''))
        dispatch(setForm("Role",''))
        if(window){
            sessionStorage.clear();
		}
		history.push('/admin/login')
		return
    }

	const getCookie = (tipe) => {
		var SecretCookie = cookies.varCookie;
		console.log("SecretCookie : " + SecretCookie)
		if (SecretCookie !== "" && SecretCookie != null && typeof SecretCookie=="string") {
			var LongSecretCookie = SecretCookie.split("|");
			var Username = LongSecretCookie[0];
			var ParamKeyArray = LongSecretCookie[1];
			var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)
		
			if (tipe === "username") {
				return Username;
			} else if (tipe === "paramkey") {
				return ParamKey;
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	const getListMenu = () => {

		var CookieParamKey = getCookie("paramkey");
        var CookieUsername = getCookie("username");

		console.log(CookieParamKey)

		var requestBody = JSON.stringify({
			"Username": CookieUsername,
			"ParamKey": CookieParamKey,
			"Method": "SELECT",
			"Page": 1,
			"RowPage": -1,
			"OrderBy": "",
			"Order": ""
		});

		console.log(requestBody)

		var url = paths.URL_API_ADMIN + 'Menu';
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
				setListMenuSidebar(data.Result)
				return
			} else {
				if (data.ErrorCode === "2") {
					setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
					return;
				} else {
					setErrorMessageAlert(data.ErrorMessage);
					setShowAlert(true);
					return;
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
    
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'scroll initial' }}>

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
			
			<Sidebar style={{ height: "100vh" }}>
				<Menu>
					<MenuItem
						icon={<MenuOutlinedIcon />}
						onClick={() => {
						collapseSidebar();
						}}
						style={{ textAlign: "center" }}
					>
						{" "}
						<h5>SIGAP</h5>
					</MenuItem>

					{ListMenuSidebar.length > 0 && ListMenuSidebar.map((item,index) => {
						var Icon = ""
						if (item.Menu === "Dashboard") {
							Icon = <FaHome />
						} else if (item.Menu === "Gudang") {
							Icon = <FaWarehouse />
						} else if (item.Menu === "Kasir") {
							Icon = <FaCashRegister />
						} else if (item.Menu === "Keuangan") {
							Icon = <FaMoneyBill />
						}
						return item.SubMenu.length > 0 ? 
						<SubMenu icon={Icon} label={item.Menu} 
						// open={item.Menu === "Gudang" ? true : false}
						>
							{item.SubMenu.map((item2,index2) => {
								var Icon2 = ""
								if (item2.Menu === "Master Data") {
									Icon2 = <FaLayerGroup />
								} else if (item2.Menu === "Stok Barang") {
									Icon2 = <FaBoxOpen />
								} else if (item2.Menu === "Scan Product") {
									Icon2 = <FaQrcode />
								} else if (item2.Menu === "Transaksi") {
									Icon2 = <FaFileInvoice />
								} else if (item2.Menu === "Rekening Koran") {
									Icon2 = <FaNewspaper />
								} else if (item2.Menu === "Report Transaksi") {
									Icon2 = <FaFileExport />
								} else if (item2.Menu === "Profit & Loss") {
									Icon2 = <FaDollarSign />
								} else if (item2.Menu === "Neraca") {
									Icon2 = <FaBalanceScale />
								}
								return item.Id === item2.ParentId && <a href={item2.Href} style={{  textDecoration:'none', color:'#000000' }}><MenuItem icon={Icon2}>{item2.Menu}</MenuItem></a>
							})}
						</SubMenu>
						:
						<MenuItem icon={Icon}>{item.Menu}</MenuItem>
					})}

					{/* <SubMenu icon={<HomeOutlinedIcon />} label="Dashboard">
						<MenuItem icon={<PeopleOutlinedIcon />}>Item 1</MenuItem>
						<MenuItem icon={<PeopleOutlinedIcon />}>Item 2</MenuItem>
						<MenuItem icon={<PeopleOutlinedIcon />}>Item 3</MenuItem>
					</SubMenu>
					<MenuItem icon={<PeopleOutlinedIcon />}>Team</MenuItem>
					<MenuItem icon={<ContactsOutlinedIcon />}>Contacts</MenuItem>
					<MenuItem icon={<ReceiptOutlinedIcon />}>Profile</MenuItem>
					<MenuItem icon={<HelpOutlineOutlinedIcon />}>FAQ</MenuItem>
					<MenuItem icon={<CalendarTodayOutlinedIcon />}>Calendar</MenuItem> */}
				</Menu>
			</Sidebar>

		</div>
    )
}

export default LeftMenu;
