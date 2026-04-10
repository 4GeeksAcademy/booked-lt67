import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {

	const { store, dispatch } = useGlobalReducer()

	const navigate = useNavigate()

	const autorLogueado = store.auth_autor || !!localStorage.getItem("token_autor");
    const lectorLogueado = store.auth_lector || !!localStorage.getItem("token_lector");
    const editorialLogueada = store.auth_editorial || !!localStorage.getItem("token_editorial");
    const adminLogueado = store.auth_admin || !!localStorage.getItem("token_admin");

    const isAuthorized = autorLogueado || lectorLogueado || editorialLogueada || adminLogueado;

	function logout_admin(){
		localStorage.removeItem("token_admin")
		dispatch({ type: "set_auth_admin", payload: false})
			navigate('/')
	}
	
	function logout_lector(){
		localStorage.removeItem("token_lector")
		dispatch({ type: "set_auth_lector", payload: false})
			navigate('/')
	}

	function logout_autor(){
		localStorage.removeItem("token_autor")
		dispatch({ type: "set_auth_autor", payload: false})
		navigate('/')
	}

	function logout_editorial(){
		localStorage.removeItem("token_editorial")
		dispatch({ type: "set_auth_editorial", payload: false})
		navigate('/')
	}

	return (
		<nav className="navbar navbar-light bg-light">
            <div className="container">
                <Link to="/">
                    <span className="navbar-brand mb-0 h1">Booked</span>
                </Link>

                {!isAuthorized && (
                    <>  
                        <Link className="btn btn-outline-primary mx-1" to="/login_lector">Log In Lector</Link>
                        <Link className="btn btn-outline-primary mx-1" to="/login_autor">Log In Autor</Link>
                        <Link className="btn btn-outline-primary mx-1" to="/login_editorial">Log In Editorial</Link>
						<Link className="btn btn-outline-primary mx-1" to="/login_admin">Log In Admin</Link>
                    </>
                )}

                {lectorLogueado && (<div className="ml-auto">
										<Link to={"/pagina_lector"} className="m-3 btn btn-m btn-outline-primary">Volver al Dashboard</Link>
										<button className="btn btn-danger" onClick={logout_lector}>Log Out</button>
									</div>)}
                {autorLogueado && (<div className="ml-auto">
										<Link to={"/pagina_autor"} className="m-3 btn btn-m btn-outline-primary">Volver al Dashboard</Link>
										<button className="btn btn-danger" onClick={logout_autor}>Log Out</button>
									</div>)}
                {editorialLogueada && (<div className="ml-auto">
										<Link to={"/pagina_editorial"} className="m-3 btn btn-m btn-outline-primary">Volver al Dashboard</Link>
										<button className="btn btn-danger" onClick={logout_editorial}>Log Out</button>
									</div>)}
                {adminLogueado &&	(<div className="ml-auto">
										<Link to={"/admin_home/"} className="m-3 btn btn-m btn-outline-primary">Volver al Dashboard</Link>
										<button className="btn btn-danger" onClick={logout_admin}>Log Out</button>
									</div>)}

				{/* <div className="ml-auto">
					<Link to="/demo">
						<button className="btn btn-primary">Check the Context in action</button>
					</Link>
				</div> */}
			</div>
		</nav>
	);
};