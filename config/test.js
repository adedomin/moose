var config = {}

config.moose = {
    // where your moose are kept safe
    db: './',
    // dump moose db every 2 hours if enables to same path as moose_db
    // as dump.json
    dump: true,
    // dump moose every x amount of ms
    dumpEvery: 1000 * 60 * 60, // 1 hour
    // max moose per minute, per ip
    maxNew: 3, // 3 moose a minute per ip
}

config.web = {
    // only set true if you're behind
    // nginx or other load balancer/revproxy
    proxied: false,
    // local port to listen on
    port: 7512,
    // keep this null to listen on all interfaces
    // change it to 127.0.0.1 to make it local only
    // or literally any 127/8 address
    interface: null, 
}

module.exports = config
