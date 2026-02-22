import sqlite3
import os

class SQL:
    def __init__(self):
        os.makedirs("database", exist_ok=True)
        
        self.con = sqlite3.connect("database/users.db")
        self.cursor = self.con.cursor()
    def create_table(self):
        self.cursor.execute("CREATE TABLE IF NOT EXISTS users(uuid, name, email, password)")
    def insert_user(self, uuid, name, email, password):
        self.cursor.execute("INSERT INTO users(uuid, name, email, password) VALUES(?, ?, ?, ?)", (uuid, name, email, password))
        self.con.commit()
    def get_users(self):
        self.cursor.execute("SELECT * FROM users")
        return self.cursor.fetchall()
    def check_user_exists(self, email):
        self.cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        return self.cursor.fetchone() is not None
    def get_user(self, email, password):
        self.cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", (email, password))
        return self.cursor.fetchone()
    def close(self):
        self.con.close()