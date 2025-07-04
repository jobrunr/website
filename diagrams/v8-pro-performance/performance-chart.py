
import numpy as np
import matplotlib.pyplot as plt
import csv

def read_perffile(filename):
	i = 0
	dict = {}

	# cols: JobRunr version, JobRunr build, StorageProvider,amount of created jobs,amount of succeeded jobs,creation duration,processing duration,job throughput (jobs / sec)
	with open(filename) as csv_file:
		for row in csv.reader(csv_file, delimiter=","):
			if i > 0:
				dict[row[2].replace("StorageProvider", "")] = float(row[7])
			i += 1

	return dict

perf_v74 = read_perffile("perf-v74.csv")
print("JobRunr v7.4.0")
print(perf_v74)
perf_v80 = read_perffile("perf-v80.csv")
print("JobRunr v8.0.0")
print(perf_v80)

def draw():
	#c = ['tab:blue', 'tab:blue', 'tab:red', 'tab:red', 'tab:red', 'tab:red', 'tab:red']
	xlbls = list(perf_v74.keys())
	y74 = list(perf_v74.values())
	y80 = list(perf_v80.values())
	x = np.arange(len(y80))
	width = 0.27

	fig, ax = plt.subplots()
	v74 = ax.bar(x, y74, width, color="red")
	v80 = ax.bar(x+width, y80, width, color="blue")

	ax.set_xticks(x+width)
	ax.set_xticklabels(xlbls)
	ax.legend((v74[0], v80[0]), ('JobRunr 7.4.0', 'JobRunr 8.0.0'))

	ax.set(xlabel='StorageProvider Type', ylabel='Job Throughput (Higher = better)', title='JobRunr Pro v8 Performance Comparison')
	fig.tight_layout()
	plt.show()

draw()
