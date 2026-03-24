from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional

db = SQLAlchemy()

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)


    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }
    
class Lector(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    username: Mapped[str] = mapped_column(String(120), nullable=False)
    nombre: Mapped[str] = mapped_column(String(120),  nullable=False)
    apellido: Mapped[str] = mapped_column(String(120), nullable=False)
    pais_donde_reside: Mapped[str] = mapped_column(String(120), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    favorites_autor: Mapped[List["Lector_Autores_Favoritos"]] = relationship(back_populates="lector")

    def __repr__(self):
        return f"{self.nombre} {self.apellido}"

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "pais_donde_reside": self.pais_donde_reside,
            # do not serialize the password, its a security breach
        }
    
class Editorial(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    pais: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "pais": self.pais,
            "email": self.email
        }

class Autor(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    apellido: Mapped[str] = mapped_column(String(120), nullable=False)
    pais: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    favorited: Mapped[List["Lector_Autores_Favoritos"]] = relationship(back_populates="autor")

    def __repr__(self):
        return f"{self.nombre} {self.apellido}"

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,            
            "pais": self.pais,
            "email": self.email
        }

class Lector_Autores_Favoritos(db.Model):

    id: Mapped[int] = mapped_column(primary_key=True)

    lector_id: Mapped[int] = mapped_column(ForeignKey("lector.id"), nullable=False)
    autor_id: Mapped[int] = mapped_column(ForeignKey("autor.id"), nullable=False)

    lector: Mapped["Lector"] = relationship(back_populates="favorites_autor")
    autor: Mapped["Autor"] = relationship(back_populates="favorited")

    def serialize(self):
        return {
            "id": self.id,
            "lector_id": self.lector_id,
            "autor_id": self.autor_id,

            "nombre_lector": f"{self.lector.nombre} {self.lector.apellido}",
            "nombre_autor": f"{self.autor.nombre} {self.autor.apellido}"
        }