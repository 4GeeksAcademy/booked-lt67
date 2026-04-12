import React, { useState, useEffect, useContext } from "react";

const AdminVerification = () => {
    const [pendientes, setPendientes] = useState({ autores: [], editoriales: [] });

    // Función para obtener los datos
    const loadPending = async () => {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/pending`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token_admin")}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            setPendientes(data);
        }
    };

    useEffect(() => {
        loadPending();
    }, []);

    // Función para Aprobar o Rechazar
    const handleAction = async (id, type, action) => {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/verify_account`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token_admin")}`
            },
            body: JSON.stringify({ id, type, action })
        });

        if (response.ok) {
            loadPending(); // Recargamos la lista para que desaparezca el procesado
            alert(`Perfil ${action === 'verify' ? 'aprobado' : 'rechazado'} con éxito`);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Solicitudes de Verificación Pendientes</h2>
            <hr />
            <h4 className="mt-4">Autores</h4>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>País</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {pendientes.autores.map((autor) => (
                        <tr key={autor.id}>
                            <td>{autor.nombre} {autor.apellido}</td>
                            <td>{autor.email}</td>
                            <td>{autor.pais}</td>
                            <td>
                                <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() => handleAction(autor.id, "autor", "verify")}
                                >
                                    Aprobar
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleAction(autor.id, "autor", "reject")}
                                >
                                    Rechazar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h4 className="mt-4">Editoriales</h4>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>País</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {pendientes.editoriales.map((editorial) => (
                        <tr key={editorial.id}>
                            <td>{editorial.nombre}</td>
                            <td>{editorial.email}</td>
                            <td>{editorial.pais}</td>
                            <td>
                                <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() => handleAction(editorial.id, "editorial", "verify")}
                                >
                                    Aprobar
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleAction(editorial.id, "editorial", "reject")}
                                >
                                    Rechazar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Si no hay pendientes, mostrar un mensaje */}
            {pendientes.autores.length === 0 && pendientes.editoriales.length === 0 && (
                <div className="alert alert-info">No hay solicitudes pendientes por ahora. ✨</div>
            )}
        </div>
    );
};

export default AdminVerification