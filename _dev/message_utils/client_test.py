import pulsar
from pulsar import AuthenticationBasic

development_user = "superuser"
development_password = "admin"

client = pulsar.Client(service_url='pulsar://localhost:6650',
                       authentication=AuthenticationBasic(development_user, development_password))
consumer = client.subscribe(topic='my-topic-test-2', subscription_name='my-sub')

while True:
    msg = consumer.receive()
    print("Received message: '%s'" % msg.data())
    consumer.acknowledge(msg)

client.close()
