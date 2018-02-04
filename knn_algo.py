import numpy as np

class KNN:
    def __init__ (self, k):
        """ Pass k and distanceFn as the hyperparameter"""
        self.k = k

    def train(self, X, y):
        """During training time stores the references of the input only"""
        self.tX = X
        self.ty = y

    def predict(self, X):
        """predict a given X predit y"""
        num_training = X.shape[0]
        YPred = np.zeros(num_training, dtype = self.ty.dtype)

        for i in range(num_training):
            distances = np.reshape(np.sqrt(np.sum(np.square(self.tX - X[i, :]), axis=1)), (-1, 1))
            distance_label = np.hstack((distances, self.ty))
            sorted_distance = distance_label[distance_label[:,0].argsort()]
            k_sorted_distance = sorted_distance[:self.k,:]
            (labels, occurence) = np.unique(k_sorted_distance[:, 1], return_counts=True)
            label = labels[occurence.argsort()[0]]
            YPred[i] = label

        return YPred