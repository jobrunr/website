
import numpy as np
import matplotlib.pyplot as plt
import csv

def read_perffile(filename, modifier):
	i = 0
	dict = {}

	# example data: 2025-05-01T15:01:46.406977210Z,Ubuntu-2204-jammy-amd64-base,21.0.4+7-LTS,JobRunr Pro,7.5.0 (HEAD),PostgresStorageProvider,500010,533339,PT32.042008295S,PT6M38.138275332S,1340.05
	# cols: date, server, linux version, jobrunr pro/oss, jobrunr version, storage provider, jobs, processed, time, time, throughput
	with open(filename) as csv_file:
		for row in csv.reader(csv_file, delimiter=","):
			print(row[5])
			dict[row[5].replace("StorageProvider", "")] = float(row[10]) * modifier
			i += 1

	return dict

print("-- Reading JobRunr v7.5.0")
perf_v75 = read_perffile("perf-v75.csv", 1)
print(perf_v75)

print("-- Reading JobRunr v8.0.0")
perf_v80 = read_perffile("perf-v80.csv", 0.9)
print(perf_v80)

def draw():
	#c = ['tab:blue', 'tab:blue', 'tab:red', 'tab:red', 'tab:red', 'tab:red', 'tab:red']
	xlbls = list(perf_v75.keys())
	y75 = list(perf_v75.values())
	y80 = list(perf_v80.values())
	x = np.arange(len(y80))
	width = 0.27

	fig, ax = plt.subplots()
	v75 = ax.bar(x, y75, width, color="#7931B3")
	v80 = ax.bar(x+width, y80, width, color="#6bace5")

	ax.set_xticks(x+width)
	ax.set_xticklabels(xlbls)
	ax.legend((v75[0], v80[0]), ('JobRunr 7.5.0', 'JobRunr 8.0.0'))

	ax.set(xlabel='StorageProvider Type', ylabel='Job Throughput (Higher = better)', title='JobRunr Pro v8 Performance Comparison')
	fig.tight_layout()
	plt.show()

draw()
