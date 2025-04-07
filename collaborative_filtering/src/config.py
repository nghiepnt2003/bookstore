from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SERVER_URL = os.getenv('SERVER_URL')

config = Config()