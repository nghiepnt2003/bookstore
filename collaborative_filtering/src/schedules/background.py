import datetime
import pandas as pd
from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.collab_filtering.cf import CF
from apscheduler.schedulers.background import BackgroundScheduler
from src.schedules.helper.products import get_products

recommended: list[str] = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler()
    scheduler.add_job(calc_recommendation, "interval", minutes = 1)
    scheduler.start()
    yield

def calc_recommendation():
    products = get_products()
    print(f"Cron job {datetime.datetime.now()} with {len(products)} item")

    # data file
    # r_cols = ['user_id', 'item_id', 'rating']
    # ratings = pd.read_csv('src/collab_filtering/ex1.dat', sep = ' ', names = r_cols, encoding='latin-1')
    ratings = pd.DataFrame(products)

    user_ids = sorted(set(ratings['user_id'].values))
    item_ids = sorted(set(ratings['item_id'].values))

    user_ids_mapping = {user_id: i for i, user_id in enumerate(user_ids)}
    item_ids_mapping = {item_id: i for i, item_id in enumerate(item_ids)}

    ratings['user_id'] = ratings['user_id'].map(user_ids_mapping)
    ratings['item_id'] = ratings['item_id'].map(item_ids_mapping)

    reverse_user_ids_mapping = {v: k for k, v in user_ids_mapping.items()}
    reverse_item_ids_mapping = {v: k for k, v in item_ids_mapping.items()}

    Y_data = ratings.values
    rs = CF(Y_data, k = 2, user_ids_mapping = reverse_user_ids_mapping, item_ids_mapping = reverse_item_ids_mapping, uuCF = 0)
    rs.fit()
    global recommended
    recommended = rs.get_recommendation()

def get_recommended():
    return recommended