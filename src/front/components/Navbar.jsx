import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {

	const { store, dispatch } = useGlobalReducer()

	const navigate = useNavigate()

	const isAuthorized = store.auth_autor || store.auth_editorial || store.auth_lector || store.auth_admin

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
					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
				</Link>
				
			

	
				{!isAuthorized && (
                    <>	
						<Link className="btn btn-primary" to="/login_lector">Log In Lector</Link>
                        <Link className="btn btn-primary" to="/login_autor">Log In Autor</Link>
                        <Link className="btn btn-primary" to="/login_editorial">Log In Editorial</Link>
						<Link className="btn btn-primary" to="/login_admin">Log In Admin</Link>
                    </>
                )}
				{store.auth_lector? <button className="btn btn-primary" onClick={logout_lector}>LogOut</button>:null}
				{store.auth_autor? <button className="btn btn-primary" onClick={logout_autor}>LogOut</button>:null}
				{store.auth_editorial? <button className="btn btn-primary" onClick={logout_editorial}>LogOut</button>:null}
				{store.auth_admin? <button className="btn btn-primary" onClick={logout_admin}>LogOut</button>:null}
				
				<div className="ml-auto">
					<Link to="/demo">
						<button className="btn btn-primary">Check the Context in action</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};