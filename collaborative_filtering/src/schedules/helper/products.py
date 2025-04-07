import requests
from src.config import config

def get_products():
    rs = requests.get(f'{config.SERVER_URL}/product/')
    rs = rs.json()

    products = rs.get('products')
    return_products = []
    for product in products:
        for rating in product.get("ratings", []):
            train_item = {
                "user_id": rating.get("user", "null"),
                "item_id": rating.get("product", "null"),
                "rating": float(rating.get("star"))
            }
            return_products.append(train_item)

    return return_products