import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import SelectorUbicacion from "./24_Georreferenciacion";
import logoBookedUrl from "../assets/img/logo_booked.png"; // Asegúrate de que esta ruta sea correcta

const SignUpLector = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [pais, setPais] = useState('');
    const [ubicacion, setUbicacion] = useState({ lat: null, lng: null });

    const { store, dispatch } = useGlobalReducer();

    if (store.auth_lector === true) {
        return <Navigate to="/pagina_lector" />;
    }

    function sendData(e) {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "username": username,
                "password": password,
                "nombre": nombre,
                "apellido": apellido,
                "pais": pais,
                "latitud": ubicacion.lat,
                "longitud": ubicacion.lng
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + 'api/signup_lector', requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error al crear el lector");
                return response.json();
            })
            .then(data => {
                alert("¡Bienvenido a Booked! Cuenta creada con éxito.");
                localStorage.setItem("token_lector", data.access_token);
                localStorage.setItem("lector_id", data.lector_id);
                dispatch({
                    type: "set_auth_lector",
                    payload: { auth: true, id: data.lector_id, nombre: data.nombre }
                });
            })
            .catch(err => {
                console.error("Error:", err);
                alert("No se pudo completar el registro.");
            });
    }

    return (
        <div className="container-fluid min-vh-100 bg-light py-5 d-flex align-items-center">
            <div className="container">
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden mx-auto" style={{ maxWidth: "850px" }}>
                    <div className="row g-0">
                        {/* Panel Izquierdo: Bienvenida con Azul Suave */}
                        <div 
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center"
                            style={{ backgroundColor: "#eaf2ff" }} // Azul pálido para que resalte el logo
                        >
                            <img 
                                src={logoBookedUrl} // Corregido: sin llaves extras
                                alt="Booked Logo" 
                                style={{ height: "100px", width: "auto" }} 
                                className="mb-4" 
                            />
                            <h3 className="fw-bold text-primary">Únete a la Comunidad</h3>
                            <p className="small text-muted">Crea tu perfil para descubrir, reseñar y compartir tus lecturas favoritas.</p>
                        </div>

                        {/* Panel Derecho: Formulario */}
                        <div className="col-lg-8 bg-white p-4 p-md-5">
                            <h2 className="fw-bold text-dark mb-4 h3">Registro de Lector</h2>
                            
                            <form onSubmit={sendData}>
                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Username</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-0 rounded-start-pill"><i className="fas fa-at"></i></span>
                                            <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" className="form-control bg-light border-0 rounded-end-pill py-2" placeholder="Tu usuario" required />
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Nombre</label>
                                        <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" className="form-control form-control-sm bg-light border-0 rounded-pill py-2 px-3" placeholder="Juan" required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Apellido</label>
                                        <input value={apellido} onChange={(e) => setApellido(e.target.value)} type="text" className="form-control form-control-sm bg-light border-0 rounded-pill py-2 px-3" placeholder="Pérez" required />
                                    </div>

                                    <div className="col-md-12 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Email</label>
                                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control form-control-sm bg-light border-0 rounded-pill py-2 px-3" placeholder="email@ejemplo.com" required />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Contraseña</label>
                                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="form-control form-control-sm bg-light border-0 rounded-pill py-2 px-3" placeholder="••••••••" required />
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">País</label>
                                        <input value={pais} onChange={(e) => setPais(e.target.value)} type="text" className="form-control form-control-sm bg-light border-0 rounded-pill py-2 px-3" placeholder="Chile" required />
                                    </div>

                                    {/* Mapa de Ubicación */}
                                    <div className="col-12 mb-4">
                                        <label className="form-label small fw-bold text-secondary text-uppercase mb-2 d-block">Tu Ubicación (Opcional)</label>
                                        <div className="rounded-3 overflow-hidden border bg-light p-2" style={{ height: "250px" }}>
                                            <SelectorUbicacion onLocationSelect={setUbicacion} />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm mb-3">
                                    CREAR CUENTA
                                </button>

                                <div className="text-center">
                                    <span className="text-muted small">¿Ya tienes cuenta? </span>
                                    <Link to="/login_lector" className="text-primary fw-bold text-decoration-none small">Inicia Sesión</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpLector;