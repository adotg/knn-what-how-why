# knn-what-how-why

## KNN-What

KNN stands for K Nearest Neighbour. It is probably one the most basic classificaiton algorithm (although it can be used in regression). This algorithm is generally parameterized using different hyperparameter like value of K, distance function, algorithm used to calculate neigherst neighbour etc. However this project illustrates the most basic selection of these parameters.

> The principle behind nearest neighbor methods is to find a predefined number of training samples closest in distance to the new point, and predict the label from these.

## KNN-How

The algorithm consists of the following stages
- Calculate distance between a point and every other point
- Sort the distances
- Filter the distance based on the value of K
- Majority vote the filtered distance

### [Checkout demo for the algorithm](https://adotg.github.io/knn-what-how-why/)


## KNN-Why

Although its not a state of the art algorithm, clever use of knn can be found in practical use case where there are less dimensions and involved and distibution of data is not taken into account.

- KNN is super intuitive
- It can work on linear or non-linear distributed data

---

### About this project

[Intro to image classification with KNN](https://medium.com/@YearsOfNoLight/intro-to-image-classification-with-knn-987bc112f0c2)

---
### Prerequisite 
- Python3
- Jupyter Notebook
- All the packages from requirement.txt

### How to use
- To check out the illustration, open `illustration/index.html` in browser (Only tested in chrome.)
- To run the jupyter notebook, run jupyter and navigate to the the path where the notebook file is saved.
