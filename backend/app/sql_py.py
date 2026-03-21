import os
import re
import sqlite3

IDENTIFIER_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")

class SQL:
    def __init__(self):
        os.makedirs("database", exist_ok=True)
        self.con = sqlite3.connect("database/data.db")
        self.cursor = self.con.cursor()

    def _validate_identifier(self, identifier: str) -> str:
        if not IDENTIFIER_PATTERN.fullmatch(identifier):
            raise ValueError(f"Invalid SQL identifier: {identifier!r}")
        return identifier

    def create_table(self, table_name: str, table_columns: list[str]):
        validated_table_name = self._validate_identifier(table_name)
        self.cursor.execute(
            f"CREATE TABLE IF NOT EXISTS {validated_table_name}({', '.join(table_columns)})"
        )
        self.con.commit()

    def insert_data(self, table_name: str, columns: list[str], values: list[str]):
        validated_table_name = self._validate_identifier(table_name)
        validated_columns = [self._validate_identifier(column) for column in columns]
        placeholders = ", ".join(["?" for _ in values])
        self.cursor.execute(
            f"INSERT INTO {validated_table_name}({', '.join(validated_columns)}) "
            f"VALUES({placeholders})",
            values,
        )
        self.con.commit()

    def get_data(
        self,
        table_name: str,
        columns: list[str],
        where_column: str | None = None,
        where_value: str | None = None,
    ):
        validated_table_name = self._validate_identifier(table_name)
        validated_columns = [self._validate_identifier(column) for column in columns]
        query = f"SELECT {', '.join(validated_columns)} FROM {validated_table_name}"
        parameters: tuple[str, ...] = ()
        if where_column is not None:
            validated_where_column = self._validate_identifier(where_column)
            query += f" WHERE {validated_where_column} = ?"
            parameters = (where_value or "",)
        self.cursor.execute(query, parameters)
        if where_column is not None:
            return self.cursor.fetchone()
        return self.cursor.fetchall()

    def check_data_exists(self, table_name: str, column: str, value: str):
        validated_table_name = self._validate_identifier(table_name)
        validated_column = self._validate_identifier(column)
        self.cursor.execute(
            f"SELECT 1 FROM {validated_table_name} WHERE {validated_column} = ?",
            (value,),
        )
        return self.cursor.fetchone() is not None

    def close(self):
        self.con.close()