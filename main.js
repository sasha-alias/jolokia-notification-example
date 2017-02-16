var express = require('express')
var app = express()
var request = require('request');
var express = require('express')
var app = express()

var node = process.argv[2];
var port = process.argv[3];
var mbean = process.argv[4];

var node_url = "http://"+node+":"+port

var registerSubscriber = function(err_callback){

    var register_request = {
        uri: node_url+"/jolokia/notification/register",
        method: "POST",
        json: true,
        body: {
        command: "register",
            type: "notification",
        }
    }

    request(register_request, function (err, response, body){
        if (err){
            err_callback(err);
        } else {
            if (body.status == 200){
                var subscriber_id = body.value.id;
                var notification_store = body.value.backend.pull.store;
                subscribe(subscriber_id, notification_store, err_callback);
            } else {
                err_callback("Unexpected result: "+body)
            }
        }
    });
}

var subscribe = function(subscriber_id, notification_store, err_callback){

    var subscribe_request = {
        uri: node_url+"/jolokia/notification/add",
        method: "POST",
        json: true,
        body: {
            type: "notification",
            command: "add",
            client: subscriber_id,
            mode: "pull",
            mbean: mbean,
            filter: [],
            config: {
                "myConfig": "extra config information"
            },
            handback: "handback"
        }
    }

    request(subscribe_request, function (err, response, body){
        if (err){
            err_callback(err);
        } else {
            if (body.status == 200){
                var subscription_handle = body.value;
                console.log("subscribed OK. subscriber_id="+subscriber_id+" store="+notification_store+" handle="+subscription_handle);
                pollNotifications(subscriber_id, notification_store, subscription_handle);
            }
        }
    });
}

var pollNotifications = function(subscriber_id, notification_store, subscription_handle){
    var uri = node_url+"/jolokia/"
    var poll_request = {
        uri: uri,
        method: "POST",
        json: true,
        body: {
           type: "exec",
           mbean: notification_store,
           operation: "pull",
           arguments: [subscriber_id, subscription_handle],
        }
    }

    request(poll_request, function(err, response, body){
        if (err){
            return console.log(err);
        } else {
            console.log(body.value);
        }
        setTimeout(pollNotifications, 3000, subscriber_id, notification_store, subscription_handle);
    });
}


app.get('/', function (req, res) {
  res.send("Jolokia JMX Notification Test")
})

app.listen(8080, function () {
    registerSubscriber(function(err){
        console.log(err);
    });
})

