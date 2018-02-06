import numpy as np

def default_progress_fn(i, total):
    pass

class KNN:
    def __init__ (self, k, progress_fn=default_progress_fn):
        """ Pass k as hyperparameter"""
        self.k = k
        self.progress_fn = progress_fn

    def train(self, X, y):
        """
            X is example training matrix. Every row of X contains one training example. Each training example
            may have `d` features. If there are `m` such examples then X is `m x d` matrix.
            y is the label matrix corrosponding to each training example. Hence y is `m x 1` matrix.
        """

        # During training time stores the references of the input only
        self.tX = X
        self.ty = y

    def predict(self, X):
        """
            Predict y based on test data X.
        """

        num_training = X.shape[0]
        YPred = np.zeros(num_training, dtype = self.ty.dtype)

        for i in range(num_training):
            # Euclidean distance is used to find out distance between two datapoint.
            distances = np.reshape(np.sqrt(np.sum(np.square(self.tX - X[i, :]), axis=1)), (-1, 1))
            # Along with the distance stack the labels so that we can vote easily
            distance_label = np.hstack((distances, self.ty))
            # Simple majority voting based on the minimum distance
            sorted_distance = distance_label[distance_label[:,0].argsort()]
            k_sorted_distance = sorted_distance[:self.k,:]
            (labels, occurence) = np.unique(k_sorted_distance[:, 1], return_counts=True)
            label = labels[occurence.argsort()[0]]
            YPred[i] = label

            self.progress_fn(i, num_training)

        return YPred