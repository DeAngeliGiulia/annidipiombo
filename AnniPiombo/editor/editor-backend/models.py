import mysql.connector
from werkzeug.security import generate_password_hash
import os

# Connessione iniziale senza database

def create_tables():
    mydb = mysql.connector.connect(
        host = os.getenv('MYSQL_HOST'),
        user = 'root',
        password = os.getenv('MYSQL_ROOT_PASSWORD'),
        database = os.getenv('MYSQL_DATABASE')
    ) 
    # Crea un cursore per eseguire le query
    mycursor = mydb.cursor()
    
    # Crea il database se non esiste
    mycursor.execute("CREATE DATABASE IF NOT EXISTS piombobase")

    # Seleziona il database appena creato
    mycursor.execute("USE piombobase")

    # Crea la tabella users
    mycursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER NOT NULL AUTO_INCREMENT,
            username VARCHAR(80) NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at DATETIME,
            last_login DATETIME,
            is_active BOOLEAN,
            PRIMARY KEY (id),
            UNIQUE (username)
        );
    """)

    # Crea la tabella events
    mycursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER NOT NULL AUTO_INCREMENT,
            title VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            date DATE NOT NULL,
            location VARCHAR(200),
            coordinatex VARCHAR(500),
            coordinatey VARCHAR(500),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            tags VARCHAR(200),
            is_important BOOLEAN,
            images TEXT,
            created_by INTEGER,
            updated_by INTEGER,
            PRIMARY KEY (id),
            FOREIGN KEY(created_by) REFERENCES users(id),
            FOREIGN KEY(updated_by) REFERENCES users(id)
        );
    """)

    #Chiude la connessione
    mydb.commit()
    mycursor.close()
    mydb.close()

# Esegui la funzione per creare database e tabelle



def initialize_database():
    conn = mysql.connector.connect(
        host = os.getenv('MYSQL_HOST'),
        user = 'root',
        password = os.getenv('MYSQL_ROOT_PASSWORD'),
        database = os.getenv('MYSQL_DATABASE')
    )
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM users")
    (count,) = cursor.fetchone()

    if count == 0:
        print("Nessun utente trovato. Creazione utente admin...")
        hashed_password = generate_password_hash("admin123")
        cursor.execute("""
            INSERT INTO users (username, password, created_at, last_login, is_active)
            VALUES (%s, %s, NOW(), NULL, TRUE)
        """, ("admin", hashed_password))
        conn.commit()
        print("Utente admin creato.")

    cursor.close()
    conn.close()
