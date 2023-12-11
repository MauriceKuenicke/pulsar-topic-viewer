import pulsar
from pulsar import AuthenticationBasic
import time

client = pulsar.Client('pulsar://localhost:6650', authentication=AuthenticationBasic("superuser", "admin"))
producer = client.create_producer('my-topic')

time.sleep(5)
for i in range(10):
    producer.send(('hello-pulsar-%d' % i).encode('utf-8'))
