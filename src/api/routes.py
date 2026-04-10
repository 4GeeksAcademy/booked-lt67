"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Lector, Editorial, Autor, Libro, LibrosFavoritos, Lector_Autores_Favoritos, Seguidor, Reviews, Admin, PostEditorial, LecturaActual, PostAutor
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func

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

    libro = Libro.query.get(libro_id)

    if libro is None:
        return jsonify({"msg": f"El libro con ID {libro_id} no existe"}), 404

    db.session.delete(libro)
    db.session.commit()
    return jsonify({"msg": "Libro eliminado con éxito"}), 200


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
    items = Lector_Autores_Favoritos.query.filter_by(
        autor_id=id_del_autor).all()
    if not items:
        return jsonify({"message": "Nadie tiene a este autor como favorito aún"}), 404
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

    autor = Autor.query.filter_by(email=email).first()


    #if autor is None:
    #    return jsonify({"msg": "Bad username or password"}), 401
    
    if check_password_hash(autor.password, password):
        access_token = create_access_token(identity=str(autor.id))
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
        autor.is_verified = True

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
            is_verified=True
        )

        db.session.add(nuevo_autor)
        db.session.commit()
        msg = "Usuario creado con éxito"
        autor_final = nuevo_autor

    access_token = create_access_token(identity=str(autor_final.id))

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

    access_token = create_access_token(identity=str(lector.id))

    return jsonify({
        "access_token": access_token,
        "lector_id": lector.id,
        "nombre": lector.nombre,
        "msg": "Login exitoso"
    }), 200


@api.route("/login_editorial", methods=["POST"])
def login_editorial():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    editorial = Editorial.query.filter_by(email=email).first()
    if editorial is None:
        return jsonify({"msg": "Bad username or password"}), 401
    if password != editorial.password:
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=email)
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
        pais_donde_reside=body.get("pais"),
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
    access_token = create_access_token(identity=str(nuevo_lector.email))

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
    nombre = body.get("nombre")
    pais = body.get("pais", "Desconocido")
    image_url = body.get("image_url")  # Captura la URL de Cloudinary

    if not nombre_ed or not email or not password:
        return jsonify({"msg": "Datos incompletos"}), 400

    
    editorial = Editorial.query.filter(Editorial.nombre.ilike(f"%{nombre_ed}%")).first()

    if editorial:
        if editorial.is_verified:
            return jsonify({"msg": "Esta editorial ya tiene un dueño"}), 400
        
        editorial.email = email
        editorial.password = generate_password_hash(password)
        editorial.pais = pais
        editorial.image_url = image_url
        editorial.is_verified = True
        msg = "Has reclamado tu perfil editorial con éxito"
    else:

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
        return jsonify({"msg": msg, "editorial_id": editorial.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al registrar"}), 500


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
def create_post_editorial():

    body = request.get_json()

    nuevo = PostEditorial(
        editorial_id=body["editorial_id"],
        texto=body["texto"]
    )

    db.session.add(nuevo)
    db.session.commit()

    return jsonify(nuevo.serialize()), 201


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
def create_post_autor():
    body = request.get_json()
    if not body or "autor_id" not in body or "texto" not in body:
        return jsonify({"msg": "Faltan datos: autor_id y texto son obligatorios"}), 400

    nuevo_post = PostAutor(
        autor_id=body["autor_id"],
        texto=body["texto"]
    )

    db.session.add(nuevo_post)
    db.session.commit()

    return jsonify(nuevo_post.serialize()), 201


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
                "content": f"Resume el libro '{book_title}' en 3 parrafos, narrando introduccion, desarrollo y desenlance, todo en español."
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
        Autor.is_verified == False
    ).all()

    return jsonify([a.serialize() for a in autores]), 200

@api.route('/buscar_editorial', methods=['GET'])
def buscar_editorial():
    nombre = request.args.get("nombre")
    editorial = Editorial.query.filter(Editorial.nombre.ilike(f"%{nombre}%")).first()
    if editorial:
        return jsonify(editorial.serialize()), 200 
    return jsonify({"msg": "No encontrada"}), 404

@api.route('/reconocer_portada', methods=['POST'])
def reconocer_portada():
    if 'portada' not in request.files:
        return jsonify({"message": "No se envió ninguna imagen"}), 400

    file = request.files['portada']
    image_data = file.read()

    try:
        # 1. Cargamos AMBAS llaves desde el .env
        api_key_gemini = os.getenv("GEMINI_API_KEY")
        api_key_books = os.getenv("GOOGLE_BOOKS_API_KEY")

        # Le pasamos la llave de Gemini a la IA
        ai_client = genai.Client(api_key=api_key_gemini)

        prompt = """
        Mira la imagen de esta portada de libro. Extrae la información y devuelve un JSON.
        Si conoces el libro, completa los datos con tu conocimiento de experto bibliotecario.
        
        Campos requeridos en el JSON:
        'titulo', 'autor', 'editorial', 'descripcion', 'paginas', 'categoria'
        
        Si no reconoces el libro, devuelve {"titulo": "Error", "autor": "No detectado"}.
        """

        # Forzamos a la IA a responder en JSON puro
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                prompt,
                types.Part.from_bytes(data=image_data, mime_type=file.mimetype)
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        # Ahora ia_data ya viene como un diccionario gracias al response_mime_type
        ia_data = json.loads(response.text)

        if ia_data.get("titulo") == "Error":
            return jsonify({"message": "No se pudo identificar el libro"}), 200

        # 1. Búsqueda MEJORADA en Google Books usando intitle e inauthor + API KEY de Books
        titulo_limpio = ia_data.get('titulo', '').replace(' ', '+')
        autor_limpio = ia_data.get('autor', '').replace(' ', '+')

        # Formato exacto que le gusta a Google: intitle:Cien+Años+de+Soledad+inauthor:Gabriel+García
        query = f"intitle:{titulo_limpio}+inauthor:{autor_limpio}"

        # 👇 AQUÍ USAMOS LA NUEVA LLAVE DE BOOKS 👇
        google_books_url = f"https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=5&key={api_key_books}"

        # ESTO IMPRIMIRÁ LA URL EN TU TERMINAL DE FLASK
        print(f"--- URL DE GOOGLE BOOKS: {google_books_url} ---")

        res_books = requests.get(google_books_url).json()

        # ESTO IMPRIMIRÁ SI GOOGLE BOOKS DA UN ERROR
        if "error" in res_books:
            print(f"--- ERROR DE GOOGLE BOOKS: {res_books['error']} ---")

        portada_url = "https://placehold.co/400x600/e2e8f0/475569.png?text=Sin+Portada"

        if "items" in res_books:
            # Buscar la primera imagen disponible
            for item in res_books["items"]:
                info = item.get("volumeInfo", {})
                if "imageLinks" in info and "thumbnail" in info["imageLinks"]:
                    portada_url = info["imageLinks"]["thumbnail"].replace(
                        "http://", "https://")
                    break

            # Rellenar textos
            info_principal = res_books["items"][0]["volumeInfo"]
            ia_data["editorial"] = ia_data.get(
                "editorial") or info_principal.get("publisher", "Desconocida")
            ia_data["descripcion"] = ia_data.get("descripcion") or info_principal.get(
                "description", "Sin descripción.")
            ia_data["paginas"] = ia_data.get(
                "paginas") or info_principal.get("pageCount", "N/A")
            ia_data["categoria"] = info_principal.get(
                "categories", ["General"])[0]
        else:
            print("--- GOOGLE BOOKS NO DEVOLVIÓ NINGÚN LIBRO ('items' no encontrado) ---")

        ia_data["portada_url"] = portada_url

        # ESTO IMPRIMIRÁ EL JSON FINAL QUE SE ENVÍA A REACT
        print(f"--- JSON ENVIADO AL FRONTEND: {ia_data} ---")

        return jsonify({"message": "¡Éxito!", "libro": ia_data}), 200

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
