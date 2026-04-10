import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
url = "https://api.groq.com/openai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "model": "llama-3.3-70b-versatile", # El modelo actual y potente
    "messages": [
        {
            "role": "user",
            "content": "Resume el libro 'Don Quijote de la Mancha' en una sola frase épica y corta."
        }
    ]
}

print("⏳ Consultando a Groq (Llama 3)...")

try:
    response = requests.post(url, headers=headers, json=payload)
    data = response.json()
    
    if response.status_code == 200:
        texto = data['choices'][0]['message']['content']
        print("\n🚀 ¡VICTORIA! Groq responde:")
        print("-" * 30)
        print(texto)
        print("-" * 30)
    else:
        print(f"\n❌ Error: {data}")
except Exception as e:
    print(f"\n❌ Error de conexión: {e}")