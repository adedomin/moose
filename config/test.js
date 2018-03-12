var config = {}

config.logger = { level: 'debug' }

config.moose = {
    // where your moose are kept safe
    // and where channel invites are persisted.
    db: './',
    // dump moose db every 2 hours if enables to same path as moose_db
    // as dump.json
    dump: true,
    // dump moose every x amount of ms
    dumpEvery: 1000 * 60 * 60, // 1 hour
    // max moose per minute, per ip
    maxNew: 3, // 3 moose a minute per ip
    maxPageReq: 50, // 50 gallery req every 30 sec before throttling
    maxGetReq: 10, // max number of moose gets before throttling
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

// set diabled to true to disable the irc client
config.irc = {
    disabled: false,
    server: 'irc.rizon.net',
    port: 6697,
    nick: 'neomoose_',
    tls: true,
    nickserv_pass: '',
    channels: ['#prussian'],
    // delay per moose
    send_delay: 350, // be very careful adjusting this
    // time between moose to send
    moose_delay: 10 * 1000,
    // timeout for .help, .source and .bots command
    help_spam: 10 * 1000,
    // timeout for the --help command
    moose_help_spam: 10 * 1000,
    // timeout for searching for moose
    moose_search_spam: 10 * 1000,
    // timeout for sending a "please wait message" when
    // a moose is being drawn somewhere
    moose_please_wait_spam: 10 * 1000,
    moose_url: 'https://moose.ghetty.space',
}

module.exports = config
