import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import SelectorUbicacion from "../pages/24_Georreferenciacion"; // Asegúrate de que la ruta sea correcta

const CompletarRegistroAutor = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { store, dispatch } = useGlobalReducer();

    // Recuperamos los datos del Paso 1
    const { nombre, apellido, email, password, autorIdSeleccionado } = location.state || {};

    // Cambiamos el string 'pais' por el objeto de coordenadas
    const [ubicacion, setUbicacion] = useState({ lat: null, lng: null });
    const [cargando, setCargando] = useState(false);

    // Protección de ruta
    useEffect(() => {
        if (!email || !nombre || !password) {
            navigate("/signup_autor");
        }
    }, [email, nombre, password, navigate]);

    if (store.auth_autor === true) {
        return <Navigate to="/pagina_autor" />;
    }

    function sendData(e) {
        if (e) e.preventDefault();
        setCargando(true);
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "password": password,
                "nombre": nombre,
                "apellido": apellido,
                "latitud": ubicacion.lat,  // Enviamos latitud
                "longitud": ubicacion.lng, // Enviamos longitud
                "reclamar_id": autorIdSeleccionado
                // 'pais' eliminado ya que se obtiene de la ubicación en el backend o dashboard
            })
        };

        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

        fetch(`${baseUrl}/api/signup_autor`, requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error en el registro de autor");
                return response.json();
            })
            .then(data => {
                localStorage.setItem("autor_id", data.autor_id);
                localStorage.setItem("token_autor", data.access_token);
                localStorage.setItem("nombre_autor", data.nombre);
                localStorage.setItem("horaLoginAutor", new Date().getTime());

                dispatch({ 
                    type: "set_auth_autor", 
                    payload: { auth: true, id: data.autor_id, nombre: data.nombre } 
                }); 

                alert(autorIdSeleccionado ? "¡Perfil reclamado con éxito!" : "¡Cuenta de autor creada con éxito!");
                navigate("/pagina_autor");
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Hubo un error al procesar el registro.");
                setCargando(false);
            });
    }

    if (!email) return null; 

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "950px" }}>
                    <div className="row g-0">
                        
                        {/* PANEL IZQUIERDO: Informativo */}
                        <div 
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center text-white position-relative overflow-hidden"
                            style={{ backgroundColor: "#1e99bd" }}
                        >
                            <i className="fas fa-feather-alt position-absolute opacity-10" style={{ fontSize: '7rem', top: '-15px', left: '-10px' }}></i>

                            <div className="position-relative z-index-1">
                                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-info-booked mb-4 shadow" style={{ width: '80px', height: '80px' }}>
                                    <i className="fas fa-map-marked-alt fa-2x"></i>
                                </div>
                                <h3 className="fw-bold mb-3">Tu taller en el mapa</h3>
                                <p className="small opacity-75 mb-4">
                                    Define tu ubicación base. Esto permitirá que los lectores de tu zona se enteren de tus próximos eventos o firmas de libros.
                                </p>
                            </div>
                        </div>

                        {/* PANEL DERECHO: Formulario con Mapa */}
                        <div className="col-lg-8 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
                            <div className="mb-4 pb-2 border-bottom d-flex justify-content-between align-items-end flex-wrap gap-2">
                                <div>
                                    <h2 className="fw-bold text-dark h3 mb-1">Casi terminamos</h2>
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>— Paso final</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <Link to="/signup_autor" className="btn btn-sm btn-light border rounded-pill px-3 shadow-sm text-muted">
                                        <i className="fas fa-arrow-left me-1"></i> Volver
                                    </Link>
                                    <span className="badge bg-success border rounded-pill px-3 py-2">Paso 2 de 2</span>
                                </div>
                            </div>
                            
                            <form onSubmit={sendData}>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-2">
                                            <i className="fas fa-crosshairs text-info-booked me-2"></i>
                                            Marca tu ubicación principal
                                        </label>
                                        
                                        {/* Mapa interactivo */}
                                        <div className="rounded-4 overflow-hidden border shadow-sm bg-light p-1" style={{ height: "300px" }}>
                                            <SelectorUbicacion onLocationSelect={setUbicacion} />
                                        </div>
                                        
                                        <p className="text-muted text-center mt-2 mb-4" style={{ fontSize: '0.8rem' }}>
                                            Haz clic en el mapa para situar tu marcador. 
                                            {autorIdSeleccionado && " Vincularemos esta ubicación a tu perfil reclamado."}
                                        </p>
                                    </div>
                                </div>

                                <div className="d-grid gap-3">
                                    <button 
                                        type="submit" 
                                        className="btn btn-booked-blue btn-lg rounded-pill fw-bold shadow-sm py-3"
                                        disabled={cargando}
                                    >
                                        {cargando ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span> Finalizando...</>
                                        ) : (
                                            "FINALIZAR Y ENTRAR AL PANEL"
                                        )}
                                    </button>

                                    {/* Opción de omitir si no quieren poner ubicación ahora */}
                                    <button 
                                        type="button" 
                                        onClick={() => sendData()} 
                                        className="btn btn-link text-muted btn-sm text-decoration-none"
                                        disabled={cargando}
                                    >
                                        Saltar este paso por ahora
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompletarRegistroAutor;