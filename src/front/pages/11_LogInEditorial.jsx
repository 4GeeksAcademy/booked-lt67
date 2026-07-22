import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logoBookedUrl from "../assets/img/logo_booked.png";

const LogInEditorial = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    if (store.auth_editorial === true) {
        return <Navigate to="/pagina_editorial" />;
    }

    function sendData(e) {
        e.preventDefault();
        setCargando(true);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "password": password
            })
        };

        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        const urlFinal = `${baseUrl}/api/login_editorial`;

        fetch(urlFinal, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Login failed");
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem("token_editorial", data.access_token);
                localStorage.setItem("editorial_id", data.editorial_id);
                localStorage.setItem("nombre_editorial", data.nombre); 
                localStorage.setItem("horaLogineditorial", new Date().getTime()); 

                dispatch({
                    type: "set_auth_editorial",
                    payload: {
                        auth: true,
                        id: data.editorial_id,
                        nombre: data.nombre
                    }
                });

                navigate("/pagina_editorial");
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Credenciales de editorial incorrectas. Por favor, verifica tus datos.");
                setCargando(false);
            });
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "950px" }}>
                    <div className="row g-0">

                        {/* PANEL IZQUIERDO: Bienvenida Editorial */}
                        <div
                            className="col-lg-5 d-flex flex-column align-items-center justify-content-center p-5 text-center text-white position-relative overflow-hidden"
                            style={{ backgroundColor: "#24b0d9" }}
                        >
                            <i className="fas fa-university position-absolute opacity-10" style={{ fontSize: '7rem', top: '-15px', left: '-10px' }}></i>

                            <div className="position-relative z-index-1">
                                <img
                                    src={logoBookedUrl}
                                    alt="Booked Logo"
                                    style={{ height: "70px", width: "auto", filter: "brightness(0) invert(1)" }}
                                    className="mb-4 drop-shadow"
                                />
                                <h3 className="fw-bold mb-3">Centro de control.</h3>
                                <p className="small opacity-75 mb-4">
                                    Accede a tu panel corporativo para gestionar el catálogo de tu editorial, analizar el alcance global y conectar con los lectores.
                                </p>
                                <hr className="w-25 mx-auto border-white opacity-50 mb-4" />
                                <p className="small mb-0">¿Aún no has registrado tu editorial?</p>
                                <Link to="/signup_editorial" className="btn btn-outline-light rounded-pill px-4 mt-2 fw-bold shadow-sm">
                                    Regístrate aquí
                                </Link>
                            </div>
                        </div>

                        {/* PANEL DERECHO: Formulario Login */}
                        <div className="col-lg-7 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
                            <div className="mb-5 pb-2 border-bottom d-flex justify-content-between align-items-end">
                                <div>
                                    <h2 className="fw-bold text-dark h3 mb-1">Portal Editorial</h2>
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>— Inicia Sesión</span>
                                </div>
                                <div className="bg-light rounded-circle p-3 text-info-booked shadow-sm">
                                    <i className="fas fa-building fa-lg"></i>
                                </div>
                            </div>

                            <form onSubmit={sendData}>
                                <div className="row g-4">

                                    {/* Input Email */}
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Correo Corporativo</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-info-booked ps-4"><i className="fas fa-envelope"></i></span>
                                            <input
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                type="email"
                                                className="form-control bg-light border-0 py-3 ps-2"
                                                placeholder="contacto@editorial.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Input Password */}
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Contraseña</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-info-booked ps-4"><i className="fas fa-lock"></i></span>
                                            <input
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                type="password"
                                                className="form-control bg-light border-0 py-3 ps-2"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-grid mt-5">
                                    <button
                                        type="submit"
                                        className="btn btn-booked-blue btn-lg rounded-pill fw-bold shadow-sm d-flex justify-content-center align-items-center py-3"
                                        disabled={cargando}
                                    >
                                        {cargando ? (
                                            <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span> Validando credenciales...</>
                                        ) : (
                                            <>INGRESAR A MI CUENTA  <i className="fas fa-sign-in-alt ms-2"></i></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LogInEditorial;