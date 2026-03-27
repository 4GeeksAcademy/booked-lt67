import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {

	const { store, dispatch } = useGlobalReducer()

	const navigate = useNavigate()

	function logout(){
		localStorage.removeItem("token")
		dispatch({ type: "set_auth", payload: false})
		navigate('/')
	}


	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">

				<Link to="/">
					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
				</Link>
				
				<Link className="btn btn-primary" to="/login_autor">Log In Autor</Link>

				{store.auth? <button className="btn btn-primary" onClick={logout}>LogOut</button>:null}
				
				<div className="ml-auto">
					<Link to="/demo">
						<button className="btn btn-primary">Check the Context in action</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};