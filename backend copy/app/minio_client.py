from minio import Minio
import os
from dotenv import load_dotenv
import urllib3


load_dotenv()


print(f"MINIO_ENDPOINT: {os.getenv('MINIO_ENDPOINT')}")
print(f"MINIO_ACCESS_KEY: {os.getenv('MINIO_ACCESS_KEY')}")
print(f"MINIO_SECRET_KEY: {os.getenv('MINIO_SECRET_KEY')}")


client = Minio(
    os.getenv("MINIO_ENDPOINT"),
    access_key=os.getenv("MINIO_ACCESS_KEY"),
    secret_key=os.getenv("MINIO_SECRET_KEY"),
    secure=False,
)





