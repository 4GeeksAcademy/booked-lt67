import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {

	const { store, dispatch } = useGlobalReducer()

	const navigate = useNavigate()

	function logout_lector(){
		localStorage.removeItem("token_lector")
		dispatch({ type: "set_auth_lector", payload: false})
		navigate('/')
	}


	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">

				<Link to="/">
					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
				</Link>
				
				<Link className="btn btn-primary" to="/login_lector">Log In Lector</Link>

				{store.auth_lector? <button className="btn btn-primary" onClick={logout_lector}>LogOut</button>:null}
				
				<div className="ml-auto">
					<Link to="/demo">
						<button className="btn btn-primary">Check the Context in action</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};