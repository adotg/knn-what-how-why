from PIL import Image
import numpy as np
from IPython.display import display

def default_label_fn(i, original):
    return original

def show_img(img_arr, label_arr, meta, index, label_fn=default_label_fn):
    """
        Given a numpy array of image from CIFAR-10 labels this method transform the data so that PIL can read and show
        the image.
        Check here how CIFAR encodes the image http://www.cs.toronto.edu/~kriz/cifar.html
    """
    
    one_img = img_arr[index, :]
    # Assume image size is 32 x 32. First 1024 px is r, next 1024 px is g, last 1024 px is b from the (r,g b) channel
    r = one_img[:1024].reshape(32, 32)
    g = one_img[1024:2048].reshape(32, 32)
    b = one_img[2048:]. reshape(32, 32)
    rgb = np.dstack([r, g, b])
    img = Image.fromarray(np.array(rgb), 'RGB')
    display(img)
    print(label_fn(index, meta[label_arr[index][0]].decode('utf-8')))