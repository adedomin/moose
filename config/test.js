var config = {}

// where your moose are kept safe
config.moose_db = './'
// dump moose db every 2 hours if enables to same path as moose_db
// as dump.json
config.moose_dump = true

config.web = {
    port: 7512,
    // keep this null to listen on all interfaces
    // change it to 127.0.0.1 to make it local only
    interface: null, 
}

module.exports = config
