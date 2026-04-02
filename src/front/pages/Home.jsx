import React, { useEffect } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import logoBookedUrl from "../assets/img/logo_booked.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link } from "react-router-dom";

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	useEffect(() => {
		loadMessage()
	}, [])

	return (
		<div className="text-center mt-5">

			<h1 className="display-4">Bienvenido al desarrollo de Booked!</h1>
			<p className="lead">
				{/* <img src={rigoImageUrl} className="img-fluid rounded-circle mb-3" alt="Rigo Baby" /> */}
				<img src={logoBookedUrl} style={{ width: "500px", height: "auto" }} className="img-fluid rounded-circle mb-3" alt="Logo Booked" />
			</p>
			{/* <Link className="btn btn-primary" to="/lector">Ver Lectores</Link>

			<Link className="btn btn-primary" to="/editorial">Ver Editoriales</Link>
			
			<Link className="btn btn-primary" to="/autor">Ver Autores</Link>

			<Link className="btn btn-primary" to="/libro">Ver Libros</Link>

			<Link className="btn btn-primary" to="/lector_autores_favoritos">Ver lector autores favoritos</Link>

			<Link className="btn btn-primary" to="/ver_seguidores">Ver Seguidores</Link>

			<Link className="btn btn-primary" to="/review">Ver Reviews</Link> */}
			
			<Link className="btn btn-primary" to="/post_free">Ver Publicaciones y Noticias</Link>


			<div className="alert alert-info">
				{store.message ? (
					<span>{store.message}</span>
				) : (
					<span className="text-danger">
						Loading message from the backend (make sure your python 🐍 backend is running)...
					</span>
				)}
			</div>
		</div>
	);
}; 