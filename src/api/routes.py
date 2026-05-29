"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Lector, Editorial, Autor, Libro, LibrosFavoritos, Lector_Autores_Favoritos, Seguidor, Reviews, Admin, PostEditorial, LecturaActual, PostAutor, Mensaje, DmLector, Comentario, PostLector
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func, or_

from urllib.parse import quote

import json
import requests
from google import genai
from google.genai import types

from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

import cloudinary
import cloudinary.utils
import time
import os
import requests

from werkzeug.utils import secure_filename

api = Blueprint('api', __name__)
# Allow CORS requests to this API
CORS(api)


cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME2'),
    api_key=os.getenv('CLOUDINARY_API_KEY2'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET2'),
    secure=True
)



@api.route('/upload_image', methods=['GET'])
def upload_image():
    timestamp = int(time.time())
    params_to_sign = {
        "timestamp": timestamp,
        "source": "uw",
        "folder": "libros_portadas"
    }
    signature = cloudinary.utils.api_sign_request(
        params_to_sign,
        cloudinary.config().api_secret
    )
    return jsonify({
        "signature": signature,
        "timestamp": timestamp,
        "apiKey": cloudinary.config().api_key,
        "cloudName": cloudinary.config().cloud_name
    }), 200


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/lector', methods=['GET'])
def get_lectores():

    all_lectores = Lector.query.all()
    print(all_lectores)
    results = list(map(lambda lector: lector.serialize(), all_lectores))
    return jsonify(results), 200


@api.route('/lector/<int:lector_id>', methods=['GET'])
def get_lector(lector_id):

    lector = Lector.query.filter_by(id=lector_id).first()
    print(lector.serialize)
    return jsonify(lector.serialize()), 200


@api.route('/lector/<int:lector_id>', methods=['DELETE'])
def delete_lector(lector_id):

    lector = Lector.query.filter_by(id=lector_id).first()
    if lector is None:
        return {
            "message": "No se encontro el lector con el id" + str(lector_id)
        }, 400
    print(lector.serialize)
    db.session.delete(lector)
    db.session.commit()
    response_body = {
        "message": "Se elimino el lector: " + lector.username
    }

    return jsonify(response_body), 200


@api.route('/lector', methods=['POST'])
def add_lectores():
    body = request.get_json()

    email_existente = Lector.query.filter_by(email=body["email"]).first()
    if email_existente:
        return jsonify({"message": "El correo electrónico ya está registrado"}), 400

    username_existente = Lector.query.filter_by(
        username=body["username"]).first()
    if username_existente:
        return jsonify({"message": "El username ya existe, prueba otro"}), 400

    lector = Lector(
        email=body["email"],
        username=body["username"],
        nombre=body["nombre"],
        apellido=body["apellido"],
        pais_donde_reside=body.get("pais", "No especificado"),
        password=body["password"],
        latitud=body.get("latitud"),
        longitud=body.get("longitud"),
        is_active=True
    )

    db.session.add(lector)
    db.session.commit()

    response_body = {
        "message": "Se creo el lector",
        "lector": lector.serialize()
    }

    return jsonify(response_body), 200


@api.route('/lector/<int:lector_id>', methods=['PUT'])
def update_lector(lector_id):

    lector = Lector.query.filter_by(id=lector_id).first()

    body = request.get_json()

    lector.email = body.get("email", lector.email)
    lector.username = body.get("username", lector.username)
    lector.nombre = body.get("nombre", lector.nombre)
    lector.apellido = body.get("apellido", lector.apellido)
    lector.pais_donde_reside = body.get("pais", lector.pais_donde_reside)

    lector.latitud = body.get("latitud", lector.latitud)
    lector.longitud = body.get("longitud", lector.longitud)

    db.session.commit()

    response_body = {
        "message": "se actualizo la informacion del lector",
        "lector": lector.serialize()
    }

    return jsonify(response_body), 200


@api.route('/autor', methods=['GET'])
def get_autores():

    all_autores = Autor.query.all()
    print(all_autores)
    results = list(map(lambda autor: autor.serialize(), all_autores))
    return jsonify(results), 200


@api.route('/autor/<int:autor_id>', methods=['GET'])
def get_autor(autor_id):

    autor = Autor.query.filter_by(id=autor_id).first()
    print(autor.serialize)
    return jsonify(autor.serialize()), 200


@api.route('/autor', methods=['POST'])
def create_autor():
    body = request.get_json()

    if not body or "nombre" not in body or "apellido" not in body or "pais" not in body or "email" not in body or "password" not in body:
        return jsonify({"msg": "Todos los campos son obligatorios"}), 400

    new_autor = Autor(
        nombre=body.get("nombre"),
        apellido=body.get("apellido"),
        pais=body.get("pais"),
        email=body.get("email"),
        password=body.get("password")
    )

    db.session.add(new_autor)
    db.session.commit()
    return jsonify({"msg": "Autor creadao", "autor": new_autor.serialize()}), 201


@api.route('/autor/<int:autor_id>', methods=['DELETE'])
def delete_autor(autor_id):

    autor = Autor.query.get(autor_id)

    if autor is None:
        return jsonify({"msg": f"La autor con ID {autor_id} no existe"}), 404

    db.session.delete(autor)
    db.session.commit()
    return jsonify({"msg": "Autor eliminada con éxito"}), 200


@api.route('/autor/<int:autor_id>', methods=['PUT'])
def update_autor(autor_id):

    autor = Autor.query.filter_by(id=autor_id).first()

    body = request.get_json()

    autor.email = body.get("email", autor.email)
    autor.password = body.get("password", autor.password)
    autor.nombre = body.get("nombre", autor.nombre)
    autor.apellido = body.get("apellido", autor.apellido)
    autor.pais = body.get("pais donde reside", autor.pais)

    db.session.commit()

    response_body = {
        "message": "se actualizo la informacion del autor",
        "autor": autor.serialize()
    }

    return jsonify(response_body), 200


@api.route('/editorial', methods=['GET'])
def get_editoriales():

    all_editoriales = Editorial.query.all()
    print(all_editoriales)
    results = list(
        map(lambda editorial: editorial.serialize(), all_editoriales))
    return jsonify(results), 200


@api.route('/editorial/<int:editorial_id>', methods=['GET'])
def get_editorial(editorial_id):

    editorial = Editorial.query.filter_by(id=editorial_id).first()
    print(editorial.serialize)
    return jsonify(editorial.serialize()), 200


@api.route('/editorial', methods=['POST'])
def create_editorial():
    body = request.get_json()

    if not body or "nombre" not in body or "pais" not in body or "email" not in body or "password" not in body or "image_url" not in body:
        return jsonify({"msg": "Todos los campos son obligatorios"}), 400

    new_editorial = Editorial(
        nombre=body.get("nombre"),
        pais=body.get("pais"),
        email=body.get("email"),
        password=body.get("password"),
        image_url=body.get('image_url')
    )

    db.session.add(new_editorial)
    db.session.commit()
    return jsonify({"msg": "Editorial creada", "editorial": new_editorial.serialize()}), 201


@api.route('/editorial/<int:editorial_id>', methods=['DELETE'])
def delete_editorial(editorial_id):

    editorial = Editorial.query.get(editorial_id)

    if editorial is None:
        return jsonify({"msg": f"La editorial con ID {editorial_id} no existe"}), 404

    db.session.delete(editorial)
    db.session.commit()
    return jsonify({"msg": "Editorial eliminada con éxito"}), 200


@api.route('/editorial/<int:editorial_id>', methods=['PUT'])
def update_editorial(editorial_id):

    editorial = Editorial.query.filter_by(id=editorial_id).first()

    body = request.get_json()

    editorial.email = body.get("email", editorial.email)
    editorial.password = body.get("password", editorial.password)
    editorial.nombre = body.get("nombre", editorial.nombre)
    editorial.pais = body.get("pais donde reside", editorial.pais)

    editorial.image_url = body.get("image_url", editorial.image_url)

    db.session.commit()

    response_body = {
        "message": "se actualizo la informacion del editorial",
        "editorial": editorial.serialize()
    }

    return jsonify(response_body), 200


@api.route('/libro', methods=['GET'])
def get_libros():

    all_libros = Libro.query.all()
    print(all_libros)
    results = list(map(lambda libro: libro.serialize(), all_libros))
    return jsonify(results), 200


@api.route('/libro/<int:libro_id>', methods=['GET'])
def get_libro(libro_id):

    libro = Libro.query.get(libro_id)
    if libro is None:
        return jsonify({"msg": "Libro no encontrado"}), 404

    print(libro.serialize())
    return jsonify(libro.serialize()), 200


@api.route('/libro/editorial/<int:ed_id>', methods=['GET'])
def get_libros_por_editorial(ed_id):

    libros = Libro.query.filter_by(editorial_id=ed_id).all()
    return jsonify([l.serialize() for l in libros]), 200


@api.route('/libro', methods=['POST'])
def create_libro():
    body = request.get_json()

    autor_id = body.get("autor_id")
    nombre_autor_google = body.get("nombre_autor_google")
    editorial_id = body.get("editorial_id")

    if not (autor_id or nombre_autor_google) or not editorial_id:
        return jsonify({"msg": "Faltan datos del Autor o la Editorial"}), 400

    if not autor_id and nombre_autor_google:

        partes = nombre_autor_google.split(" ", 1)
        nombre_a = partes[0]
        apellido_a = partes[1] if len(partes) > 1 else ""

        autor_existente = Autor.query.filter_by(
            nombre=nombre_a, apellido=apellido_a).first()

        if autor_existente:
            autor_id = autor_existente.id
        else:
            nuevo_autor = Autor(
                nombre=nombre_a,
                apellido=apellido_a,
                is_verified=False
            )
            db.session.add(nuevo_autor)
            db.session.commit()
            autor_id = nuevo_autor.id

    new_libro = Libro(
        nombre=body.get("nombre"),
        genero=body.get("genero"),
        autor_id=autor_id,
        editorial_id=editorial_id,
        google_id=body.get("google_id"),
        isbn_13=body.get("isbn_13"),
        descripcion=body.get("descripcion"),
        image_url=body.get("image_url")
    )

    try:
        db.session.add(new_libro)
        db.session.commit()
        return jsonify({"msg": "Libro creado con éxito", "libro": new_libro.serialize()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al guardar el libro: " + str(e)}), 500


@api.route('/libro/<int:libro_id>', methods=['DELETE'])
def delete_libro(libro_id):
    # Buscamos el libro
    libro = Libro.query.get(libro_id)

    if libro is None:
        return jsonify({"msg": f"El libro con ID {libro_id} no existe"}), 404

    try:
        # 1. Borramos las reviews asociadas (usando Reviews en plural como tu import)
        Reviews.query.filter_by(libro_id=libro_id).delete()
        
        # 2. Borramos los favoritos asociados (usando LibrosFavoritos como tu import)
        LibrosFavoritos.query.filter_by(libro_id=libro_id).delete()

        LecturaActual.query.filter_by(libro_id=libro_id).delete()

        # 3. Borramos el libro
        db.session.delete(libro)
        
        # 4. Guardamos todos los cambios en una sola transacción
        db.session.commit()
        
        return jsonify({"msg": "Libro y sus registros asociados eliminados con éxito"}), 200

    except Exception as e:
        # Si algo falla, revertimos para no dejar la base de datos en un estado extraño
        db.session.rollback()
        print(f"Error detectado: {str(e)}")
        return jsonify({
            "msg": "No se pudo eliminar el libro",
            "error": str(e)
        }), 500

@api.route('/libro/<int:libro_id>', methods=['PUT'])
def update_libros(libro_id):

    libro = Libro.query.filter_by(id=libro_id).first()

    body = request.get_json()

    libro.nombre = body.get("nombre", libro.nombre)
    libro.genero = body.get("genero", libro.genero)
    if body.get("autor_id"):
        libro.autor_id = int(body["autor_id"])
    if body.get("editorial_id"):
        libro.editorial_id = int(body["editorial_id"])
    libro.image_url = body.get("image_url", libro.image_url)

    db.session.commit()

    response_body = {
        "message": "se actualizo la informacion del libro",
        "libro": libro.serialize()
    }

    return jsonify(response_body), 200


@api.route('/lector/<int:lector_id>/favoritos', methods=['GET'])
def get_favoritos_por_lector(lector_id):
    favoritos = LibrosFavoritos.query.filter_by(lector_id=lector_id).all()
    if not favoritos:
        return jsonify([]), 200

    results = [fav.serialize() for fav in favoritos]

    return jsonify(results), 200


@api.route('/favoritos/libros', methods=['POST'])
def add_libro_favorito():
    body = request.get_json()

    existe = LibrosFavoritos.query.filter_by(
        lector_id=body["lector_id"],
        libro_id=body["libro_id"]
    ).first()

    if existe:
        return jsonify({"msg": "Este libro ya está en tus favoritos"}), 400

    libro = Libro.query.get(body["libro_id"])
    if libro is None:
        return jsonify({"msg": "El Libro que intentas agregar no existe"}), 404

    new_fav = LibrosFavoritos(
        lector_id=body["lector_id"],
        libro_id=body["libro_id"]
    )
    db.session.add(new_fav)
    db.session.commit()

    return jsonify(new_fav.serialize()), 200


@api.route('/favoritos/libros/<int:lector_id>/<int:libro_id>', methods=['DELETE'])
def delete_libro_favorito(lector_id, libro_id):

    fav_to_delete = LibrosFavoritos.query.filter_by(
        lector_id=lector_id,
        libro_id=libro_id
    ).first()

    if fav_to_delete is None:
        return jsonify({"msg": "No se encontró el favorito para eliminar"}), 404

    db.session.delete(fav_to_delete)
    db.session.commit()
    return jsonify({"msg": "Libro eliminado de la lista"}), 200


@api.route('/favoritos/libros/<int:fav_id>', methods=['PUT'])
def update_libro_favorito(fav_id):

    favorito = LibrosFavoritos.query.filter_by(id=fav_id).first()

    if favorito is None:
        return jsonify({"msg": "Ese registro de favorito no existe"}), 404

    body = request.get_json()

    if "lector_id" in body:
        favorito.lector_id = body["lector_id"]
    if "libro_id" in body:
        favorito.libro_id = body["libro_id"]

    db.session.commit()
    return jsonify({
        "msg": "Favorito actualizado con éxito",
        "result": favorito.serialize()
    }), 200


@api.route('/lector_autores_favoritos', methods=['GET'])
def get_lector_autores_favoritos():

    all_lector_autores_favoritos = Lector_Autores_Favoritos.query.all()
    print(all_lector_autores_favoritos)
    results = list(map(lambda lector_autores_favoritos: lector_autores_favoritos.serialize(
    ), all_lector_autores_favoritos))
    return jsonify(results), 200


@api.route('/lector_autores_favoritos/<int:fav_id>', methods=['GET'])
def get_lector_autor_favorito(fav_id):

    item = Lector_Autores_Favoritos.query.filter_by(id=fav_id).first()
    return jsonify(item.serialize()), 200


@api.route('/lectores_por_autor/<int:id_del_autor>', methods=['GET'])
def get_lectores_por_autor(id_del_autor):
    items = Lector_Autores_Favoritos.query.filter_by(autor_id=id_del_autor).all()
    
    # En vez de 404, si no hay nadie, devolvemos un array vacío [] con estado 200
    if not items:
        return jsonify([]), 200
        
    results = [item.lector.serialize() for item in items]
    return jsonify(results), 200


@api.route('/lector_autores_favoritos', methods=['POST'])
def create_lector_autor_favorito():

    body = request.get_json()

    nuevo = Lector_Autores_Favoritos(
        lector_id=body["lector_id"],
        autor_id=body["autor_id"]
    )

    db.session.add(nuevo)
    db.session.commit()

    return jsonify(nuevo.serialize()), 201


@api.route('/lector_autores_favoritos/<int:fav_id>', methods=['PUT'])
def update_lector_autores_favoritos(fav_id):

    fav = Lector_Autores_Favoritos.query.get_or_404(fav_id)

    body = request.get_json()

    fav.lector_id = body["lector_id"]
    fav.autor_id = body["autor_id"]

    db.session.commit()

    return jsonify(fav.serialize()), 200


@api.route('/lector_autores_favoritos/<int:fav_id>', methods=['DELETE'])
def delete_lector_autor_favorito(fav_id):

    fav = Lector_Autores_Favoritos.query.get_or_404(fav_id)

    db.session.delete(fav)
    db.session.commit()

    return jsonify({"msg": "Eliminado con éxito"}), 200


@api.route('/lector/<int:id>/seguidores', methods=['GET'])
def get_seguidores(id):
    lector = Lector.query.get(id)
    if not lector:
        return jsonify({"msg": "No existe"}), 404

    lista = [{
        "relacion_id": s.id,
        "lector_que_me_sigue_id": s.lector_id,
        "username": s.lector_que_sigue.username
    } for s in lector.seguidores]

    return jsonify(lista), 200


@api.route('/lector/<int:id>/siguiendo', methods=['GET'])
def get_siguiendo(id):
    lector = Lector.query.get(id)
    if not lector:
        return jsonify({"msg": "No existe"}), 404

    lista = [{
        "relacion_id": s.id,
        "lector_seguido_id": s.seguido_id,
        "username": s.lector_seguido.username
    } for s in lector.siguiendo]

    return jsonify(lista), 200


@api.route('/follow', methods=['POST'])
def add_seguidor():

    body = request.get_json()

    check = Seguidor.query.filter_by(
        lector_id=body["seguidor_id"],
        seguido_id=body["seguido_id"]
    ).first()

    if check:
        return jsonify({"msg": "Ya sigues a este lector"}), 400

    nueva_relacion = Seguidor(
        lector_id=body["seguidor_id"],
        seguido_id=body["seguido_id"]
    )

    db.session.add(nueva_relacion)
    db.session.commit()

    return jsonify(nueva_relacion.serialize()), 201


@api.route('/unfollow/<int:id_relacion>', methods=['DELETE'])
def delete_seguido(id_relacion):

    relacion = Seguidor.query.get(id_relacion)

    if relacion is None:
        return jsonify({"msg": "Esa relación de seguimiento no existe"}), 404

    db.session.delete(relacion)
    db.session.commit()
    return jsonify({"msg": "Has dejado de seguir a este usuario correctamente"}), 200


@api.route('/seguidores/<int:id_relacion>', methods=['PUT'])
def update_seguidor(id_relacion):

    relacion = Seguidor.query.get(id_relacion)

    if relacion is None:
        return jsonify({"msg": "Ese registro de seguimiento no existe"}), 404

    body = request.get_json()
    nuevo_seguido_id = body.get("nuevo_seguido_id")

    if not nuevo_seguido_id:
        return jsonify({"msg": "Debes proporcionar el nuevo_seguido_id"}), 400

    relacion.seguido_id = nuevo_seguido_id
    db.session.commit()

    return jsonify({
        "msg": "Seguimiento actualizado",
        "resultado": relacion.serialize()
    }), 200


@api.route('/reviews', methods=['GET'])
def get_reviews():

    all_reviews = Reviews.query.all()
    print(all_reviews)
    results = list(map(lambda reviews: reviews.serialize(), all_reviews))
    return jsonify(results), 200


@api.route('/reviews/<int:review_id>', methods=['GET'])
def get_review(review_id):

    item = Reviews.query.filter_by(id=review_id).first()
    return jsonify(item.serialize()), 200


@api.route('/reviews', methods=['POST'])
def create_review():

    body = request.get_json()

    nuevo = Reviews(
        lector_id=body["lector_id"],
        libro_id=body["libro_id"],
        texto=body["texto"],
        puntuacion=body["puntuacion"]
    )

    db.session.add(nuevo)
    db.session.commit()

    return jsonify(nuevo.serialize()), 201


@api.route('/reviews/<int:review_id>', methods=['PUT'])
def update_review(review_id):

    rev = Reviews.query.get_or_404(review_id)

    body = request.get_json()

    rev.texto = body["texto"]
    rev.puntuacion = body["puntuacion"]
    rev.lector_id = body["lector_id"]
    rev.libro_id = body["libro_id"]

    db.session.commit()

    return jsonify(rev.serialize()), 200


@api.route('/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):

    rev = Reviews.query.get_or_404(review_id)

    db.session.delete(rev)
    db.session.commit()

    return jsonify({"msg": "Eliminado con éxito"}), 200


@api.route("/login_autor", methods=["POST"])
def login_autor():
    body = request.get_json()
    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña son requeridos"}), 400

    autor = Autor.query.filter_by(email=email).first()

    # Descomentamos y protegemos: si no existe, salimos de una vez de forma segura
    if autor is None:
        return jsonify({"msg": "Usuario no encontrado o datos incorrectos"}), 401
    
    if check_password_hash(autor.password, password):
        identity_data = json.dumps({"id": autor.id, "tipo": "autor"})
        access_token = create_access_token(identity=identity_data)
        return jsonify({
            "access_token": access_token,
            "autor_id": autor.id,
            "nombre": autor.nombre
        }), 200
    else:
        return jsonify({"msg": "Contraseña incorrecta"}), 401



@api.route("/signup_autor", methods=["POST"])
def signup_autor():
    body = request.get_json()

    email = body.get("email")
    password = body.get("password")
    reclamar_id = body.get("reclamar_id")
    nombre = body.get("nombre")
    apellido = body.get("apellido")
    pais = body.get("pais")

    if not all([email, password, nombre, apellido, pais]):
        return jsonify({"msg": "Faltan datos obligatorios"}), 400

    if reclamar_id:
        autor = Autor.query.get(reclamar_id)

        if not autor:
            return jsonify({"msg": "El perfil que intentas reclamar no existe"}), 404

        if autor.is_verified:
            return jsonify({"msg": "Este perfil ya ha sido reclamado por otra persona"}), 403

        autor.email = email
        autor.password = generate_password_hash(password)
        autor.nombre = body.get("nombre", autor.nombre)
        autor.apellido = body.get("apellido", autor.apellido)
        autor.pais = body.get("pais", autor.pais)
        autor.is_verified = False
        autor.verification_status = "pending"

        db.session.commit()
        msg = "Perfil reclamado y activado con éxito"
        autor_final = autor

    else:
        user_exists = Autor.query.filter_by(email=email).first()
        if user_exists:
            return jsonify({"msg": "El email ya está registrado"}), 400

        nuevo_autor = Autor(
            nombre=body.get("nombre"),
            apellido=body.get("apellido"),
            pais=body.get("pais"),
            email=email,
            password=generate_password_hash(password),
            is_verified=False,
            verification_status="pending"
        )

        db.session.add(nuevo_autor)
        db.session.commit()
        msg = "Usuario creado con éxito"
        autor_final = nuevo_autor

    access_token = create_access_token(identity={"id": autor_final.id, "tipo": "autor"})

    return jsonify({
        "msg": msg,
        "access_token": access_token,
        "autor_id": autor_final.id,
        "nombre": autor_final.nombre
    }), 201


@api.route("/login_lector", methods=["POST"])
def login_lector():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    lector = Lector.query.filter_by(email=email).first()


    #if lector is None or not check_password_hash(lector.password, password):
    #    return jsonify({"msg": "Email o contraseña incorrectos"}), 401

    identity_data = json.dumps({"id": lector.id, "tipo": "lector"})
    access_token = create_access_token(identity=identity_data)

    return jsonify({
        "access_token": access_token,
        "lector_id": lector.id,
        "nombre": lector.nombre,
        "msg": "Login exitoso"
    }), 200


@api.route("/login_editorial", methods=["POST"])
def login_editorial():
    data = request.get_json()
    email = data.get("email", None)
    password = data.get("password", None)

    if not email or not password:
        return jsonify({"msg": "Correo y contraseña son requeridos"}), 400
    editorial = Editorial.query.filter_by(email=email).first()
    fake_hash = "pbkdf2:sha256:260000$randomhashstuff" 
    
    if editorial:
        password_correct = check_password_hash(editorial.password, password)
    else:
        check_password_hash(fake_hash, password)
        password_correct = False

    if not password_correct:
        return jsonify({"msg": "El correo o la contraseña son incorrectos"}), 401

    identity_data = json.dumps({"id": editorial.id, "tipo": "editorial"})
    access_token = create_access_token(identity=identity_data)
    
    return jsonify({
        "access_token": access_token,
        "editorial_id": editorial.id,
        "nombre": editorial.nombre
    }), 200

@api.route("/signup_lector", methods=["POST"])
def signup_lector():
    body = request.get_json()

    # Usamos .get() en lugar de corchetes para evitar que el server de error
    # si alguno de los campos opcionales viene vacío.
    nuevo_lector = Lector(
        email=body.get("email"),
        username=body.get("username"),
        password=body.get("password"),
        nombre=body.get("nombre"),
        apellido=body.get("apellido"),
        pais_donde_reside=body.get("pais") or "No especificado",
        # CORRECCIÓN AQUÍ: Usar corchetes body["latitud"] o mejor body.get("latitud")
        latitud=body.get("latitud"),
        longitud=body.get("longitud"),
        is_active=True
    )

    try:
        db.session.add(nuevo_lector)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        # Imprime el error en la consola de Python para que puedas verlo mientras desarrollas
        print(f"Error en signup: {e}")
        return jsonify({"msg": "Error al crear el usuario", "error": str(e)}), 400

    # Cambiamos identity a string (versiones recientes de Flask-JWT-Extended lo requieren)
    access_token = create_access_token(identity={"id": nuevo_lector.id, "tipo": "lector"})

    return jsonify({
        "msg": "Lector creado",
        "access_token": access_token,
        "lector_id": nuevo_lector.id,
        "nombre": nuevo_lector.nombre
    }), 201


@api.route("/signup_editorial", methods=["POST"])
def signup_editorial():
    body = request.get_json()
    nombre_ed = body.get("nombre")
    email = body.get("email")
    password = body.get("password")
    # Otros campos
    pais = body.get("pais", "Desconocido")
    image_url = body.get("image_url")

    if not nombre_ed or not email or not password:
        return jsonify({"msg": "Datos incompletos"}), 400

    # Buscamos si la editorial ya existe (lógica de reclamar perfil)
    editorial = Editorial.query.filter(Editorial.nombre.ilike(f"%{nombre_ed}%")).first()

    if editorial:
        # Si ya está verificada, no se puede reclamar
        if editorial.is_verified:
            return jsonify({"msg": "Esta editorial ya tiene un dueño"}), 400
        
        # ACTUALIZACIÓN: Reclamar perfil existente
        editorial.email = email
        editorial.password = generate_password_hash(password)
        editorial.pais = pais
        editorial.image_url = image_url
        editorial.is_verified = True
        msg = "Has reclamado tu perfil editorial con éxito"
    else:
        # CREACIÓN: Editorial totalmente nueva
        editorial = Editorial(
            nombre=nombre_ed,
            email=email,
            password=generate_password_hash(password),
            pais=pais,
            image_url=image_url,
            is_verified=True 
        )
        db.session.add(editorial)
        msg = "Editorial registrada con éxito"

    try:
        db.session.commit()
        # Incluimos el access_token si quieres que haga login automático al registrarse
        access_token = create_access_token(identity={"id": editorial.id, "tipo": "editorial"})
        return jsonify({
            "msg": msg, 
            "editorial_id": editorial.id, 
            "nombre": editorial.nombre,
            "access_token": access_token # Importante para tu frontend
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error DB: {str(e)}") # Para que puedas verlo en la consola
        return jsonify({"msg": "Error al registrar en la base de datos"}), 500


@api.route("/login_admin", methods=["POST"])
def login_admin():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    admin = Admin.query.filter_by(email=email).first()
    if admin is None:
        return jsonify({"msg": "Bad username or password"}), 401
    if password != admin.password:
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=email)
    return jsonify(access_token=access_token)


@api.route("/signup_admin", methods=["POST"])
def signup_admin():
    body = request.get_json()

    email = body.get("email")
    password = body.get("password")

    if not all([email, password]):
        return jsonify({"msg": "Faltan datos obligatorios"}), 400

    admin = Editorial.query.filter_by(email=email).first()
    if admin:
        return jsonify({"msg": "Ya se encuentra un admin creado con ese correo"}), 401

    admin = Admin(email=email, password=password)

    db.session.add(admin)
    db.session.commit()

    access_token = create_access_token(identity=email)

    response_body = {
        "msg": "Admin creado",
        "access_token": access_token
    }
    return jsonify(response_body), 201


@api.route('/lector/<int:lector_id>/leyendo', methods=['GET'])
def get_lectura_actual(lector_id):
    # Buscamos todos los registros de lectura actual para ese lector
    lecturas = LecturaActual.query.filter_by(lector_id=lector_id).all()
    return jsonify([l.serialize() for l in lecturas]), 200


@api.route('/leyendo/libros', methods=['POST'])
def add_lectura_actual():
    body = request.get_json()
    # Evitar duplicados
    existe = LecturaActual.query.filter_by(
        lector_id=body["lector_id"], libro_id=body["libro_id"]).first()
    if existe:
        return jsonify({"msg": "Ya lo estás leyendo"}), 400

    nueva_lectura = LecturaActual(
        lector_id=body["lector_id"], libro_id=body["libro_id"])
    db.session.add(nueva_lectura)
    db.session.commit()
    return jsonify(nueva_lectura.serialize()), 200


@api.route('/leyendo/libros/<int:lector_id>/<int:libro_id>', methods=['DELETE'])
def delete_lectura_actual(lector_id, libro_id):
    registro = LecturaActual.query.filter_by(
        lector_id=lector_id, libro_id=libro_id).first()
    if not registro:
        return jsonify({"msg": "No encontrado"}), 404

    db.session.delete(registro)
    db.session.commit()
    return jsonify({"msg": "Lectura eliminada"}), 200


@api.route('/posteditorial', methods=['GET'])
def get_post_editorial():

    all_posts = PostEditorial.query.all()
    print(all_posts)
    results = list(map(lambda posts: posts.serialize(), all_posts))
    return jsonify(results), 200


@api.route('/posteditorial/<int:post_editorial_id>', methods=['GET'])
def get_post_editorial_by_id(post_editorial_id):

    item = PostEditorial.query.get_or_404(post_editorial_id)
    return jsonify(item.serialize()), 200


@api.route('/posteditorial/editorial/<int:ed_id>', methods=['GET'])
def get_muro_editorial(ed_id):

    posts = PostEditorial.query.filter_by(editorial_id=ed_id).all()
    return jsonify([p.serialize() for p in posts]), 200


@api.route('/posteditorial', methods=['POST'])
@jwt_required() # <-- Obligatorio para leer el token de la editorial
def create_post_editorial():
    try:
        body = request.get_json()
        if not body or "texto" not in body:
            return jsonify({"msg": "El texto de la publicación es obligatorio"}), 400

        # 1. Recuperamos el string JSON del token de la editorial
        identity_raw = get_jwt_identity() 
        
        # 2. Lo transformamos a diccionario de Python de verdad
        identity = json.loads(identity_raw) 
        
        # 3. Extraemos de forma segura el id de la editorial
        editorial_id = identity.get("id")

        # Creamos el registro usando el id extraído del JWT
        nuevo_post = PostEditorial(
            editorial_id=editorial_id,
            texto=body["texto"]
            # Si manejas imágenes o títulos de posts, agrégalos aquí de la misma forma
        )

        db.session.add(nuevo_post)
        db.session.commit()

        return jsonify({"msg": "Post de editorial creado con éxito", "post": nuevo_post.serialize()}), 201

    except Exception as e:
        # Esto imprimirá el error real en la terminal de Flask si algo más falla
        print("🔴 ERROR INTERNO EN CREATE_POST_EDITORIAL:", str(e))
        return jsonify({"msg": "Error interno de la editorial", "error": str(e)}), 500


@api.route('/posteditorial/<int:post_editorial_id>', methods=['PUT'])
def update_post_editorial(post_editorial_id):

    repos = PostEditorial.query.get_or_404(post_editorial_id)

    body = request.get_json()

    repos.texto = body["texto"]

    db.session.commit()

    return jsonify(repos.serialize()), 200


@api.route('/posteditorial/<int:post_editorial_id>', methods=['DELETE'])
def delete_post_editorial(post_editorial_id):

    repos = PostEditorial.query.get_or_404(post_editorial_id)

    db.session.delete(repos)
    db.session.commit()

    return jsonify({"msg": "Eliminado con éxito"}), 200


@api.route('/postautor', methods=['GET'])
def get_all_posts_autor():
    all_posts = PostAutor.query.order_by(PostAutor.fecha.desc()).all()
    results = [post.serialize() for post in all_posts]
    return jsonify(results), 200


@api.route('/postautor/autor/<int:aut_id>', methods=['GET'])
def get_muro_autor(aut_id):
    posts = PostAutor.query.filter_by(
        autor_id=aut_id).order_by(PostAutor.fecha.desc()).all()
    return jsonify([p.serialize() for p in posts]), 200


@api.route('/postautor', methods=['POST'])
@jwt_required() # <-- Le añadimos protección por Token
def create_post_autor():
    try:
        body = request.get_json()
        if not body or "texto" not in body:
            return jsonify({"msg": "El texto del post es obligatorio"}), 400

        # Recuperamos de forma segura el ID del autor desde el token inyectado
        identity_raw = get_jwt_identity()
        identity = json.loads(identity_raw)
        autor_id = identity.get("id")

        nuevo_post = PostAutor(
            autor_id=autor_id, # Extraído del JWT
            texto=body["texto"]
        )

        db.session.add(nuevo_post)
        db.session.commit()

        return jsonify(nuevo_post.serialize()), 201
        
    except Exception as e:
        print("🔴 ERROR EN CREATE_POST_AUTOR:", str(e))
        return jsonify({"msg": "Error interno del servidor", "error": str(e)}), 500


@api.route('/postautor/<int:post_id>', methods=['DELETE'])
def delete_post_autor(post_id):
    post = PostAutor.query.get(post_id)
    if not post:
        return jsonify({"msg": "Post no encontrado"}), 404

    db.session.delete(post)
    db.session.commit()
    return jsonify({"msg": "Post de autor eliminado"}), 200


@api.route('/postautor/<int:post_id>', methods=['PUT'])
def update_post_autor(post_id):
    post = PostAutor.query.get(post_id)
    if not post:
        return jsonify({"msg": "Post no encontrado"}), 404
    body = request.get_json()
    if "texto" in body:
        post.texto = body["texto"]

    db.session.commit()

    return jsonify(post.serialize()), 200


@api.route('/upload_foto/<int:autor_id>', methods=['POST'])
def upload_foto(autor_id):
    if 'foto' not in request.files:
        return jsonify({"msg": "No hay archivo"}), 400

    file = request.files['foto']
    filename = secure_filename(file.filename)

    upload_folder = os.path.join(os.getcwd(), "src", "static", "uploads")

    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    autor = Autor.query.get(autor_id)
    autor.foto_url = f"static/uploads/{filename}"
    db.session.commit()

    return jsonify({"msg": "Foto subida con éxito", "url": autor.foto_url}), 200


@api.route('/update_foto/<int:autor_id>', methods=['PUT'])
def update_foto(autor_id):
    if 'foto' not in request.files:
        return jsonify({"msg": "No hay archivo"}), 400

    autor = Autor.query.get(autor_id)
    if not autor:
        return jsonify({"msg": "Autor no encontrado"}), 404

    if autor.foto_url:
        old_path = os.path.join(os.getcwd(), "src", autor.foto_url)
        if os.path.exists(old_path):
            os.remove(old_path)

    file = request.files['foto']
    filename = secure_filename(file.filename)
    upload_folder = os.path.join(os.getcwd(), "src", "static", "uploads")

    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    autor.foto_url = f"static/uploads/{filename}"
    db.session.commit()

    return jsonify({"msg": "Foto actualizada", "url": autor.foto_url}), 200


@api.route('/delete_foto/<int:autor_id>', methods=['DELETE'])
def delete_foto(autor_id):
    autor = Autor.query.get(autor_id)
    if not autor or not autor.foto_url:
        return jsonify({"msg": "No hay foto para borrar"}), 404

    file_path = os.path.join(os.getcwd(), "src", autor.foto_url)
    if os.path.exists(file_path):
        os.remove(file_path)

    autor.foto_url = None
    db.session.commit()

    return jsonify({"msg": "Foto eliminada correctamente"}), 200


@api.route('/update_foto_cloudinary/<int:autor_id>', methods=['PUT'])
def update_foto_cloudinary(autor_id):

    data = request.json
    nueva_url = data.get("foto")

    if not nueva_url:
        return jsonify({"msg": "Falta la URL de la foto"}), 400

    autor = Autor.query.get(autor_id)
    if not autor:
        return jsonify({"msg": "Autor no encontrado"}), 404

    autor.foto_url = nueva_url
    db.session.commit()

    return jsonify({"msg": "Foto de Cloudinary vinculada", "url": autor.foto_url}), 200


@api.route('/delete_foto_cloudinary/<int:autor_id>', methods=['DELETE'])
def delete_foto_cloudinary(autor_id):
    autor = Autor.query.get(autor_id)
    if not autor:
        return jsonify({"msg": "Autor no encontrado"}), 404

    # Solo limpiamos el registro en la base de datos
    autor.foto_url = None
    db.session.commit()

    return jsonify({"msg": "Referencia de foto eliminada"}), 200


@api.route('/upload_foto_lector/<int:lector_id>', methods=['POST'])
def upload_foto_lector(lector_id):
    if 'foto' not in request.files:
        return jsonify({"msg": "No hay archivo en la petición"}), 400

    file = request.files['foto']
    if file.filename == '':
        return jsonify({"msg": "No se seleccionó ningún archivo"}), 400

    filename = secure_filename(file.filename)

    upload_folder = os.path.join(os.getcwd(), "src", "static", "uploads")

    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    lector = Lector.query.get(lector_id)
    if not lector:
        return jsonify({"msg": "Lector no encontrado"}), 404

    lector.foto_url = f"static/uploads/{filename}"
    db.session.commit()

    return jsonify({"msg": "Foto de lector subida con éxito", "url": lector.foto_url}), 200


@api.route('/update_foto_lector/<int:lector_id>', methods=['PUT'])
def update_foto_lector(lector_id):
    if 'foto' not in request.files:
        return jsonify({"msg": "No hay archivo"}), 400

    lector = Lector.query.get(lector_id)
    if not lector:
        return jsonify({"msg": "Lector no encontrado"}), 404

    if lector.foto_url:
        old_path = os.path.join(os.getcwd(), "src", lector.foto_url)
        if os.path.exists(old_path):
            os.remove(old_path)

    file = request.files['foto']
    filename = secure_filename(file.filename)
    upload_folder = os.path.join(os.getcwd(), "src", "static", "uploads")

    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    lector.foto_url = f"static/uploads/{filename}"
    db.session.commit()

    return jsonify({"msg": "Foto de lector actualizada", "url": lector.foto_url}), 200


@api.route('/delete_foto_lector/<int:lector_id>', methods=['DELETE'])
def delete_foto_lector(lector_id):
    lector = Lector.query.get(lector_id)
    if not lector or not lector.foto_url:
        return jsonify({"msg": "No hay foto para borrar"}), 404

    file_path = os.path.join(os.getcwd(), "src", lector.foto_url)
    if os.path.exists(file_path):
        os.remove(file_path)

    lector.foto_url = None
    db.session.commit()

    return jsonify({"msg": "Foto de lector eliminada correctamente"}), 200


@api.route('/update_foto_lector_cloudinary/<int:lector_id>', methods=['PUT'])
def update_foto_lector_cloudinary(lector_id):

    data = request.get_json()
    nueva_url = data.get("foto_url")

    if not nueva_url:
        return jsonify({"msg": "Falta la URL de la foto en el cuerpo de la petición"}), 400

    lector = Lector.query.get(lector_id)
    if not lector:
        return jsonify({"msg": "Lector no encontrado"}), 404

    lector.foto_url = nueva_url
    db.session.commit()

    return jsonify({
        "msg": "Foto de perfil (Cloudinary) vinculada con éxito",
        "url": lector.foto_url
    }), 200


@api.route('/delete_foto_lector_cloudinary/<int:lector_id>', methods=['DELETE'])
def delete_foto_lector_cloudinary(lector_id):
    lector = Lector.query.get(lector_id)
    if not lector:
        return jsonify({"msg": "Lector no encontrado"}), 404

    lector.foto_url = None
    db.session.commit()

    return jsonify({"msg": "Vínculo de foto eliminado correctamente"}), 200


@api.route('/libro_google', methods=['POST'])
def add_libro_google():
    body = request.get_json()
    google_id = body.get("google_id")

    
    existing_libro = Libro.query.filter_by(google_id=google_id).first()
    if existing_libro:
        return jsonify({
            "id": existing_libro.id,
            "message": "Este libro ya existe"
        }), 200

    
    autores_lista = body.get("autores", ["Autor Desconocido"])
    nombre_google = autores_lista[0] 

    
    nombre_google_clean = nombre_google.replace(" ", "").replace(".", "").lower()

   
    autor = Autor.query.filter(
        func.lower(
            func.replace(
                func.replace(
                    func.concat(Autor.nombre, Autor.apellido), 
                    " ", ""
                ), 
                ".", ""
            )
        ) == nombre_google_clean
    ).first()

    if not autor:
        partes = nombre_google.split(" ", 1)
        nombre_a = partes[0]
        apellido_a = partes[1] if len(partes) > 1 else ""
        
        autor = Autor(
            nombre=nombre_a,
            apellido=apellido_a,
            is_verified=False,
            email=None,
            password=None
        )
        db.session.add(autor)
        db.session.commit()

    
    nombre_ed_google = body.get("nombre_editorial", "Editorial Genérica")
    
    
    ed_clean_google = nombre_ed_google.lower().replace("editorial", "").replace("&", "").replace(" ", "").replace(".", "").strip()

   
    editorial = Editorial.query.filter(
        func.lower(
            func.replace(
                func.replace(
                    func.replace(Editorial.nombre, " ", ""), 
                    "&", ""
                ), 
                ".", ""
            )
        ).ilike(f"%{ed_clean_google}%")
    ).first()

    if not editorial:
        
        editorial = Editorial(
            nombre=nombre_ed_google,
            pais="Desconocido",
            is_active=True,
            is_verified=False, 
            email=None,
            password=None
        )
        db.session.add(editorial)
        db.session.commit()

    
    nuevo_libro = Libro(
        nombre=body.get("nombre"),
        genero=body.get("genero", "General"),
        google_id=google_id,
        isbn_13=body.get("isbn_13"),
        descripcion=body.get("descripcion"),
        image_url=body.get("image_url"),
        autor_id=autor.id,
        editorial_id=editorial.id
    )

    try:
        db.session.add(nuevo_libro)
        db.session.commit()
        return jsonify({
            "id": nuevo_libro.id,
            "msg": "Libro creado con éxito"
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error al crear libro: {str(e)}") 
        return jsonify({"error": str(e)}), 500

@api.route('/ai-summary', methods=['POST'])
@jwt_required()
def get_ai_summary():
    body = request.get_json()
    book_title = body.get("title")

    # 1. Sacamos la Key de Groq del .env
    api_key = os.getenv("GROQ_API_KEY")
    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # 2. Configuramos la petición para el libro específico
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "user",
                "content": f"Has un resumen ejectuvio del libro '{book_title}' en 4 o 5 parrafos, que incluya datos de personajes, cosas importantes de la trama para que parezca que me lei el libro, todo en español."
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        data = response.json()

        # 3. Extraemos la respuesta
        summary = data['choices'][0]['message']['content']
        return jsonify({"summary": summary}), 200

    except Exception as e:
        print(f"Error en IA: {e}")
        return jsonify({"error": "No se pudo generar el resumen"}), 500

@api.route('/autor', methods=['GET'])
def get_autores_filtro():
    nombre = request.args.get("nombre")
    apellido = request.args.get("apellido")

    if not nombre or not apellido:
        return jsonify({"msg": "Faltan parámetros de búsqueda"}), 400

    
    autores = Autor.query.filter(
        Autor.nombre.ilike(f"%{nombre}%"),
        Autor.apellido.ilike(f"%{apellido}%"),
        Autor.email == None, 
        Autor.is_verified == False 
    ).all()

    return jsonify([a.serialize() for a in autores]), 200

@api.route('/buscar_editorial', methods=['GET'])
def buscar_editorial():
    nombre = request.args.get("nombre")
    
    if not nombre:
        return jsonify({"msg": "Debes proporcionar un nombre"}), 400

   
    editoriales = Editorial.query.filter(
        Editorial.nombre.ilike(f"%{nombre}%"),
        Editorial.email == None,
        Editorial.is_verified == False
    ).all()

    return jsonify([e.serialize() for e in editoriales]), 200


@api.route('/reconocer_portada', methods=['POST'])
def reconocer_portada():
    if 'portada' not in request.files:
        return jsonify({"message": "No se envió ninguna imagen"}), 400

    file = request.files['portada']
    image_data = file.read()

    try:
        api_key_gemini = os.getenv("GEMINI_API_KEY")
        api_key_books = os.getenv("GOOGLE_BOOKS_API_KEY")
        ai_client = genai.Client(api_key=api_key_gemini)

        # 1. IA analiza la imagen
        prompt = """Mira esta portada de libro. Extrae la información y devuelve un JSON con:
        'titulo', 'autor', 'editorial', 'descripcion', 'paginas', 'categoria'"""
        
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, types.Part.from_bytes(data=image_data, mime_type=file.mimetype)],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        ia_data = json.loads(response.text)

        if ia_data.get("titulo") == "Error":
            return jsonify({"message": "No se pudo identificar el libro"}), 200

        # 2. Buscamos en Google Books para asegurar la mejor portada
        query = f"intitle:{ia_data.get('titulo')}+inauthor:{ia_data.get('autor')}"
        google_books_url = f"https://www.googleapis.com/books/v1/volumes?q={query.replace(' ', '+')}&maxResults=1&key={api_key_books}"
        res_books = requests.get(google_books_url).json()

        portada_url = "https://placehold.co/400x600/e2e8f0/475569.png?text=Sin+Portada"
        google_id = None

        if "items" in res_books:
            item = res_books["items"][0]
            google_id = item.get("id")
            info = item.get("volumeInfo", {})
            portada_url = info.get("imageLinks", {}).get("thumbnail", portada_url).replace("http://", "https://")
            ia_data["editorial"] = ia_data.get("editorial") or info.get("publisher", "Editorial Genérica")
        
        ia_data["portada_url"] = portada_url

        # --- 3. LÓGICA DE RELACIONES (AUTOR Y EDITORIAL) ---
        
        # A. Procesar Autor
        nombre_completo_autor = ia_data.get("autor", "Autor Desconocido")
        autor_clean = nombre_completo_autor.lower().replace(" ", "").replace(".", "")
        
        autor = Autor.query.filter(
            func.lower(func.replace(func.replace(func.concat(Autor.nombre, Autor.apellido), " ", ""), ".", "")) == autor_clean
        ).first()

        if not autor:
            partes = nombre_completo_autor.split(" ", 1)
            autor = Autor(
                nombre=partes[0], 
                apellido=partes[1] if len(partes) > 1 else "", 
                is_verified=False
            )
            db.session.add(autor)
            db.session.commit()

        # B. Procesar Editorial
        nombre_ed = ia_data.get("editorial", "Editorial Genérica")
        ed_clean = nombre_ed.lower().replace("editorial", "").replace(" ", "").strip()
        
        editorial = Editorial.query.filter(
            func.lower(func.replace(Editorial.nombre, " ", "")).ilike(f"%{ed_clean}%")
        ).first()

        if not editorial:
            editorial = Editorial(nombre=nombre_ed, pais="Desconocido", is_active=True, is_verified=False)
            db.session.add(editorial)
            db.session.commit()

        # C. Guardar Libro final vinculado
        libro_existente = Libro.query.filter((Libro.nombre == ia_data.get("titulo")) | (Libro.google_id == google_id)).first()

        if not libro_existente:
            nuevo_libro = Libro(
                nombre=ia_data.get("titulo"),
                genero=ia_data.get("categoria", "General"),
                google_id=google_id,
                descripcion=ia_data.get("descripcion", ""),
                image_url=ia_data.get("portada_url"),
                autor_id=autor.id,      # ID REAL vinculado
                editorial_id=editorial.id # ID REAL vinculado
            )
            db.session.add(nuevo_libro)
            db.session.commit()
            ia_data["id"] = nuevo_libro.id
        else:
            ia_data["id"] = libro_existente.id

        return jsonify({"message": "¡Éxito!", "libro": ia_data}), 200

    except Exception as e:
        db.session.rollback()
        print(f"ERROR CRÍTICO: {str(e)}")
        return jsonify({"message": "Error interno", "error": str(e)}), 500

    
    except Exception as e:
        error_msg = str(e)
        print(f"--- ERROR CRÍTICO --- \n{error_msg}")
        
        # Si los servidores de Gemini están saturados
        if "503" in error_msg or "high demand" in error_msg:
            return jsonify({"message": "La Inteligencia Artificial está muy solicitada en este momento. ¡Por favor, intenta escanear de nuevo en unos minutos!"}), 503
            
        # Si te pasaste del límite de uso
        elif "429" in error_msg:
            return jsonify({"message": "Límite de uso de la IA agotado. Inténtalo un poco más tarde."}), 429
            
        # Para cualquier otro error general
        return jsonify({"message": "Error interno al procesar la imagen."}), 500

# =======================================================
# --- RUTAS NUEVAS PARA MAPAS DE AUTOR Y EDITORIAL ---
# =======================================================


@api.route('/lectores_fav_libros_autor/<int:autor_id>', methods=['GET'])
def lectores_fav_libros_autor(autor_id):
    # Lectores que marcaron libros de ESTE autor como favoritos
    lectores = Lector.query.join(LibrosFavoritos).join(
        Libro).filter(Libro.autor_id == autor_id).all()
    # Usamos set() para no enviar coordenadas duplicadas si un lector tiene 2 libros del mismo autor
    return jsonify([l.serialize() for l in set(lectores)]), 200


@api.route('/lectores_leyendo_autor/<int:autor_id>', methods=['GET'])
def lectores_leyendo_autor(autor_id):
    # Lectores que están leyendo libros de ESTE autor
    lectores = Lector.query.join(LecturaActual).join(
        Libro).filter(Libro.autor_id == autor_id).all()
    return jsonify([l.serialize() for l in set(lectores)]), 200


@api.route('/lectores_fav_libros_editorial/<int:editorial_id>', methods=['GET'])
def lectores_fav_libros_editorial(editorial_id):
    # Lectores que marcaron libros de ESTA editorial como favoritos
    lectores = Lector.query.join(LibrosFavoritos).join(
        Libro).filter(Libro.editorial_id == editorial_id).all()
    return jsonify([l.serialize() for l in set(lectores)]), 200


@api.route('/lectores_leyendo_editorial/<int:editorial_id>', methods=['GET'])
def lectores_leyendo_editorial(editorial_id):
    # Lectores que están leyendo libros de ESTA editorial
    lectores = Lector.query.join(LecturaActual).join(
        Libro).filter(Libro.editorial_id == editorial_id).all()
    return jsonify([l.serialize() for l in set(lectores)]), 200

@api.route('/admin/pending', methods=['GET'])
@jwt_required()
def get_pending_verifications():
    current_email = get_jwt_identity()
    admin = Admin.query.filter_by(email=current_email).first()
    
    if not admin:
        return jsonify({"msg": "Acceso denegado"}), 403

    
    autores_pendientes = Autor.query.filter(
        Autor.verification_status == 'pending',
        Autor.email.isnot(None) 
    ).all()

    editoriales_pendientes = Editorial.query.filter(
        Editorial.verification_status == 'pending',
        Editorial.email.isnot(None)
    ).all()
    
    return jsonify({
        "autores": [a.serialize() for a in autores_pendientes],
        "editoriales": [e.serialize() for e in editoriales_pendientes]
    }), 200


@api.route('/admin/verify_account', methods=['PUT'])
@jwt_required()
def verify_account():
    current_user_email = get_jwt_identity()
    admin = Admin.query.filter_by(email=current_user_email).first()
    
    if not admin: 
        return jsonify({"msg": "No autorizado"}), 403

    data = request.json
    target_id = data.get("id")
    target_type = data.get("type") # "autor" o "editorial"
    action = data.get("action")   # "verify" o "reject"

    target = Autor.query.get(target_id) if target_type == "autor" else Editorial.query.get(target_id)

    if not target: 
        return jsonify({"msg": "Perfil no encontrado"}), 404

    if action == "verify":
        target.verification_status = "verified"
        target.is_verified = True
    else:
        target.verification_status = "rejected"
        target.is_verified = False

    db.session.commit()
    return jsonify({"msg": f"Perfil {action} con éxito"}), 200


@api.route('/enviar-mensaje', methods=['POST'])
@jwt_required()
def enviar_mensaje():
    body = request.get_json()
    if not body:
        return jsonify({"msg": "Faltan datos en el cuerpo"}), 400

    try:
        nuevo_mensaje = Mensaje(
            contenido=body.get("contenido"),
            lector_id=body.get("lector_id"),
            editorial_id=body.get("editorial_id"),
            tipo_emisor=body.get("tipo_emisor") # Debe ser 'lector' o 'editorial'
        )
        db.session.add(nuevo_mensaje)
        db.session.commit()
        return jsonify({"msg": "Mensaje enviado con éxito"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error al enviar: {str(e)}")
        return jsonify({"error": "No se pudo guardar el mensaje"}), 500


@api.route('/chat/<int:lector_id>/<int:editorial_id>', methods=['GET'])
@jwt_required()
def obtener_chat(lector_id, editorial_id):
    try:
        # Buscamos todos los mensajes entre este lector y esta editorial
        mensajes = Mensaje.query.filter_by(
            lector_id=lector_id, 
            editorial_id=editorial_id
        ).order_by(Mensaje.fecha_envio.asc()).all()
        
        # Serializamos de forma segura
        return jsonify([m.serialize() for m in mensajes]), 200
        
    except Exception as e:
        print(f"Error en el servidor al obtener chat: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500
    
@api.route('/mensajes/editorial/<int:ed_id>', methods=['GET'])
@jwt_required()
def obtener_mensajes_editorial(ed_id):
    mensajes = Mensaje.query.filter_by(editorial_id=ed_id).all()
    return jsonify([m.serialize() for m in mensajes]), 200

@api.route('/chat/comunidad/enviar', methods=['POST'])
@jwt_required()
def enviar_dm_lector():
    try:
        body = request.get_json()
        # No dependas solo del token para el emisor si el front ya sabe quién es
        # Hagámoslo igual al de enviar_mensaje
        nuevo_msg = DmLector(
            contenido=body.get('contenido'),
            emisor_id=body.get('emisor_id'), # <--- Cámbialo para recibirlo del body
            receptor_id=body.get('receptor_id')
        )
        db.session.add(nuevo_msg)
        db.session.commit()
        # Importante: devolver un mensaje de éxito igual que en editorial
        return jsonify({"msg": "Mensaje enviado con éxito", "nuevo_mensaje": nuevo_msg.serialize()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/chat/comunidad/<int:lector1_id>/<int:lector2_id>', methods=['GET']) 
@jwt_required()
def obtener_dm_lector(lector1_id, lector2_id):
    # Esta es la ruta que tu log marca como 404
    mensajes = DmLector.query.filter(
        ((DmLector.emisor_id == lector1_id) & (DmLector.receptor_id == lector2_id)) |
        ((DmLector.emisor_id == lector2_id) & (DmLector.receptor_id == lector1_id))
    ).order_by(DmLector.fecha_envio.asc()).all()
    
    return jsonify([m.serialize() for m in mensajes]), 200


@api.route('/mis-contactos-comunidad', methods=['GET'])
@jwt_required()
def obtener_contactos():
    # 1. Ahora sabemos que identity es el ID (el "2"), no el email
    identity_actual = get_jwt_identity()
    
    
    # 2. Buscamos por ID en lugar de email
    lector_actual = Lector.query.get(identity_actual)
    
    if not lector_actual:
        return jsonify([]), 200
        
    id_numerico = lector_actual.id
    # ... el resto del código se queda exactamente igual ...
    
    mensajes = DmLector.query.filter(
        (DmLector.emisor_id == id_numerico) | (DmLector.receptor_id == id_numerico)
    ).all()

    ids_contactos = set()
    for m in mensajes:
        if m.emisor_id != id_numerico: ids_contactos.add(m.emisor_id)
        if m.receptor_id != id_numerico: ids_contactos.add(m.receptor_id)

    if not ids_contactos:
        return jsonify([]), 200

    contactos = Lector.query.filter(Lector.id.in_(list(ids_contactos))).all()
    return jsonify([c.serialize() for c in contactos]), 200

@api.route('/comentario', methods=['POST'])
@jwt_required()
def post_comentario():
    body = request.get_json()
    
    # Extraemos el diccionario que guardamos en el login
    identidad = get_jwt_identity() 
    user_id = identidad["id"]
    tipo_usuario = identidad["tipo"]
    
    texto = body.get("texto")
    nuevo_comentario = Comentario(texto=texto)

    # 1. Asignamos quién escribe basándonos en el TIPO del token
    if tipo_usuario == 'lector':
        nuevo_comentario.lector_id = user_id
    elif tipo_usuario == 'editorial':
        nuevo_comentario.editorial_id = user_id
    elif tipo_usuario == 'autor':
        nuevo_comentario.autor_id = user_id

    # 2. Asignamos a qué post va (esto viene del frontend)
    if "post_editorial_id" in body:
        nuevo_comentario.post_editorial_id = body["post_editorial_id"]
    elif "post_autor_id" in body:
        nuevo_comentario.post_autor_id = body["post_autor_id"]
    elif "post_lector_id" in body:
        nuevo_comentario.post_lector_id = body["post_lector_id"]

    db.session.add(nuevo_comentario)
    db.session.commit()
    
    return jsonify({"msg": "¡Comentario publicado!", "comentario": nuevo_comentario.serialize()}), 201

@api.route('/post-lector', methods=['POST'])
@jwt_required()
def crear_post_lector():
    try:
        body = request.get_json()
        
        # 1. Recuperamos el string JSON que configuramos en el login
        identity_raw = get_jwt_identity() 
        
        # 2. Lo transformamos de texto a un diccionario de Python de verdad
        identity = json.loads(identity_raw) 
        
        # 3. Ahora sí podemos usar .get() de forma segura
        lector_id = identity.get("id") 
        
        if not body or not body.get("texto"):
            return jsonify({"msg": "El texto del post es obligatorio"}), 400
        
        nuevo_post = PostLector(
            lector_id=lector_id,
            texto=body.get("texto"),
            imagen_url=body.get("imagen_url")
        )
        
        db.session.add(nuevo_post)
        db.session.commit()
        
        return jsonify({"msg": "Post creado!", "post": nuevo_post.serialize()}), 201

    except Exception as e:
        # Si algo falla, esto evitará el misterioso error 500 sin explicación
        # e imprimirá el error real en tu terminal de Flask
        print("🔴 ERROR INTERNO EN CREAR_POST_LECTOR:", str(e))
        return jsonify({"msg": "Error interno del servidor", "error": str(e)}), 500
    
@api.route('/postlector/lector/<int:lector_id>', methods=['GET'])
def obtener_posts_lector(lector_id):
    try:
        # Buscamos todos los posts de ese lector ordenados del más nuevo al más viejo
        posts = PostLector.query.filter_by(lector_id=lector_id).order_by(PostLector.id.desc()).all()
        
        # Serializamos la lista
        posts_serializados = [p.serialize() for p in posts]
        return jsonify(posts_serializados), 200
        
    except Exception as e:
        print("🔴 ERROR EN OBTENER_POSTS_LECTOR:", str(e))
        return jsonify({"msg": "Error al obtener los posts", "error": str(e)}), 500
    
@api.route('/postlector/<int:post_id>', methods=['PUT'])
@jwt_required()
def actualizar_post_lector(post_id):
    try:
        body = request.get_json()
        nuevo_texto = body.get("texto")
        
        if not nuevo_texto:
            return jsonify({"msg": "El texto modificado es requerido"}), 400
            
        # Validamos quién es el dueño del token por seguridad
        identity_raw = get_jwt_identity()
        identity = json.loads(identity_raw)
        lector_id_token = identity.get("id")
        
        # Buscamos el post en la base de datos
        post = PostLector.query.get(post_id)
        if not post:
            return jsonify({"msg": "Post no encontrado"}), 404
            
        # Control de seguridad: que el lector del token sea el dueño real del post
        if post.lector_id != lector_id_token:
            return jsonify({"msg": "No tienes permisos para editar este post"}), 403
            
        # Actualizamos el campo
        post.texto = nuevo_texto
        db.session.commit()
        
        return jsonify({"msg": "Post actualizado con éxito", "post": post.serialize()}), 200
        
    except Exception as e:
        print("🔴 ERROR EN ACTUALIZAR_POST_LECTOR:", str(e))
        return jsonify({"msg": "Error al editar el post", "error": str(e)}), 500
    
@api.route('/postlector/<int:post_id>', methods=['DELETE'])
@jwt_required()
def eliminar_post_lector(post_id):
    try:
        # Validamos quién es el dueño del token por seguridad
        identity_raw = get_jwt_identity()
        identity = json.loads(identity_raw)
        lector_id_token = identity.get("id")
        
        post = PostLector.query.get(post_id)
        if not post:
            return jsonify({"msg": "Post no encontrado"}), 404
            
        # Control de seguridad estricto
        if post.lector_id != lector_id_token:
            return jsonify({"msg": "No tienes permisos para eliminar este post"}), 403
            
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({"msg": "Post eliminado permanentemente"}), 200
        
    except Exception as e:
        print("🔴 ERROR EN ELIMINAR_POST_LECTOR:", str(e))
        return jsonify({"msg": "Error al eliminar el post", "error": str(e)}), 500
    
@api.route('/comentarios', methods=['POST'])
@jwt_required()
def crear_comentario():
    try:
        body = request.get_json()
        texto = body.get("texto")
        post_id = body.get("post_id")
        tipo_post = body.get("tipo_post") # Puede ser: 'lector', 'autor' o 'editorial'
        
        # 🌟 NUEVO: Extraemos el parent_id (si viene, será el ID del comentario padre; si no, será None)
        parent_id = body.get("parent_id") 

        if not texto or not post_id or not tipo_post:
            return jsonify({"msg": "Faltan datos obligatorios: texto, post_id y tipo_post"}), 400

        # 1. Identificamos quién está comentando gracias al Token
        identity_raw = get_jwt_identity()
        identity = json.loads(identity_raw)
        user_id = identity.get("id")
        tipo_usuario = identity.get("tipo") # 'lector', 'autor' o 'editorial'

        # 2. Inicializamos el nuevo comentario de forma limpia
        # 🌟 NUEVO: Le pasamos directamente el parent_id aquí
        nuevo_comentario = Comentario(
            texto=texto,
            parent_id=parent_id
        )

        # 3. Asignamos quién es el creador según el token (Tu lógica perfecta)
        if tipo_usuario == "lector":
            nuevo_comentario.lector_id = user_id
        elif tipo_usuario == "autor":
            nuevo_comentario.autor_id = user_id
        elif tipo_usuario == "editorial":
            nuevo_comentario.editorial_id = user_id

        # 4. Asignamos en qué muro/post se está comentando (Tu lógica perfecta)
        if tipo_post == "lector":
            nuevo_comentario.post_lector_id = post_id
        elif tipo_post == "autor":
            nuevo_comentario.post_autor_id = post_id
        elif tipo_post == "editorial":
            nuevo_comentario.post_editorial_id = post_id
        else:
            return jsonify({"msg": "tipo_post no válido"}), 400

        db.session.add(nuevo_comentario)
        db.session.commit()

        return jsonify({"msg": "Comentario publicado!", "comentario": nuevo_comentario.serialize()}), 201

    except Exception as e:
        print("🔴 ERROR EN CREAR_COMENTARIO:", str(e))
        return jsonify({"msg": "Error interno al comentar", "error": str(e)}), 500
    
@api.route('/comentarios/<string:tipo_post>/<int:post_id>', methods=['GET'])
def obtener_comentarios_post(tipo_post, post_id):
    try:
        # Buscamos los comentarios según el tipo de muro
        if tipo_post == "lector":
            comentarios = Comentario.query.filter_by(post_lector_id=post_id).order_by(Comentario.id.asc()).all()
        elif tipo_post == "autor":
            comentarios = Comentario.query.filter_by(post_autor_id=post_id).order_by(Comentario.id.asc()).all()
        elif tipo_post == "editorial":
            comentarios = Comentario.query.filter_by(post_editorial_id=post_id).order_by(Comentario.id.asc()).all()
        else:
            return jsonify({"msg": "tipo_post no válido"}), 400

        return jsonify([c.serialize() for c in comentarios]), 200

    except Exception as e:
        print("🔴 ERROR EN OBTENER_COMENTARIOS_POST:", str(e))
        return jsonify({"msg": "Error al obtener comentarios", "error": str(e)}), 500
    
@api.route('/comentarios/<int:comentario_id>', methods=['PUT'])
@jwt_required()
def actualizar_comentario(comentario_id):
    try:
        body = request.get_json()
        nuevo_texto = body.get("texto")

        if not nuevo_texto:
            return jsonify({"msg": "El texto es obligatorio"}), 400

        # Identificamos al usuario por el token
        identity_raw = get_jwt_identity()
        identity = json.loads(identity_raw)
        user_id = identity.get("id")
        tipo_usuario = identity.get("tipo")

        comentario = Comentario.query.get(comentario_id)
        if not comentario:
            return jsonify({"msg": "Comentario no encontrado"}), 404

        # CONTROL DE SEGURIDAD: Validar que el que edita sea el dueño real
        es_dueno = False
        if tipo_usuario == "lector" and comentario.lector_id == user_id:
            es_dueno = True
        elif tipo_usuario == "autor" and comentario.autor_id == user_id:
            es_dueno = True
        elif tipo_usuario == "editorial" and comentario.editorial_id == user_id:
            es_dueno = True

        if not es_dueno:
            return jsonify({"msg": "No tienes permisos para editar este comentario"}), 403

        comentario.texto = nuevo_texto
        db.session.commit()

        return jsonify({"msg": "Comentario actualizado", "comentario": comentario.serialize()}), 200

    except Exception as e:
        print("🔴 ERROR EN ACTUALIZAR_COMENTARIO:", str(e))
        return jsonify({"msg": "Error al editar comentario", "error": str(e)}), 500
    
@api.route('/comentarios/<int:comentario_id>', methods=['DELETE'])
@jwt_required()
def eliminar_comentario(comentario_id):
    try:
        identity_raw = get_jwt_identity()
        identity = json.loads(identity_raw)
        user_id = identity.get("id")
        tipo_usuario = identity.get("tipo")

        comentario = Comentario.query.get(comentario_id)
        if not comentario:
            return jsonify({"msg": "Comentario no encontrado"}), 404

        # CONTROL DE SEGURIDAD: Validar que el que borra sea el dueño real
        es_dueno = False
        if tipo_usuario == "lector" and comentario.lector_id == user_id:
            es_dueno = True
        elif tipo_usuario == "autor" and comentario.autor_id == user_id:
            es_dueno = True
        elif tipo_usuario == "editorial" and comentario.editorial_id == user_id:
            es_dueno = True

        if not es_dueno:
            return jsonify({"msg": "No tienes permisos para eliminar este comentario"}), 403

        db.session.delete(comentario)
        db.session.commit()

        return jsonify({"msg": "Comentario eliminado permanentemente"}), 200

    except Exception as e:
        print("🔴 ERROR EN ELIMINAR_COMENTARIO:", str(e))
        return jsonify({"msg": "Error al eliminar comentario", "error": str(e)}), 500