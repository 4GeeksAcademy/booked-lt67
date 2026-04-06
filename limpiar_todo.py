# Cambia 'from app' por 'from src.app'
from src.app import app, db 
from sqlalchemy import text

with app.app_context():
    try:
        db.session.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE'))
        db.drop_all()
        db.create_all()
        db.session.commit()
        print("✅ ¡Base de datos de Booked reseteada y limpia!")
    except Exception as e:
        print(f"❌ Error al limpiar: {e}")