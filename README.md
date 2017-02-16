# jolokia-notification-example

Example of subscribing to JMX notifications from MBeans via Jolokia

Usage:

```
git clone https://github.com/sasha-alias/jolokia-notification-example
cd jolokia-notification-example
npm install

node main.js <host> <port> <mbean>
```

Example:
```
node main.js localhost 8778 "org.apache.cassandra.db:type=StorageService"
```

