import numpy as np
import random
import math

def gen_points(val_seed_xy=(80, 100), num_class=2, num_points=100, global_std=20):
    # cluster center
    centers = []
    for i in range(num_class):
        centers.append((val_seed_xy[0] * random.random(), val_seed_xy[1] * random.random()))
    
    # Points near centers
    X = np.empty(shape=[0, 2])
    y = np.empty(shape=[0, 1])
    for i in range(num_points):
        cls = num_class * random.random()
        cls = math.floor(cls)
        xcord = centers[cls][0] + global_std * random.random()
        ycord = centers[cls][1] + global_std * random.random()
        X = np.append(X, [[xcord, ycord]], axis=0)
        y = np.append(y, [[cls]], axis=0)
    
    return (X, y)