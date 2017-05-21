var config = {}

// where your moose are kept safe
config.moose_db = './'

config.web = {
    port: 7512,
    // keep this null to listen on all interfaces
    // change it to 127.0.0.1 to make it local only
    interface: null, 
}

module.exports = config
