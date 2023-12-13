import pulsar
from pulsar import AuthenticationBasic
import time
import random
import numpy as np

client = pulsar.Client('pulsar://localhost:6650', authentication=AuthenticationBasic("superuser", "admin"))
producer = client.create_producer('my-topic-test-2')

time.sleep(5)
for i in range(10000):
    if random.random() >= 0.8:
        time.sleep(random.random())
    if random.random() < 0.2:
        time.sleep(random.randint(0,5))
    producer.send(('hello-pulsar-%d' % i).encode('utf-8'))
    print('hello-pulsar-%d' % i)
