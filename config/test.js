'use strict';
let config = {};

config.logger = { level: 'debug' };

config.moose = {
    // where your moose are kept safe
    // and where channel invites are persisted.
    db: './',
    // dump moose db every 2 hours if enables to same path as moose_db
    // as dump.json
    dump: true,
    // dump moose every x amount of ms
    dumpEvery: 1000 * 60 * 60, // 1 hour
};

config.web = {
    // new antispam options
    antispam: {
        new_moose: {
            time_window: 60 * 1000, // 1 min in ms
            max: 3,
        },
        gallery: {
            time_window: 10 * 1000, // 30 sec
            delay_request: 150, // 300ms
            max: 20, // 10 gallery pages til delay
        },
        get_moose: {
            time_window: 30 * 1000,
            delay_request: 300,
            max: 50, // 60 moose a time window before delay
        },
        // this api is very slow due to how images are generated
        get_image: {
            time_window: 15 * 1000,
            delay_request: 300,
            max: 5, // 5 pics a time window
        },
    },
    // size in bytes of moose images to cache in memory
    cache_max_size: (1024 * 1024) * 5,
    // only set true if you're behind
    // nginx or other load balancer/revproxy
    proxied: false,
    // local port to listen on
    port: 7512,
    // keep this null to listen on all interfaces
    // change it to 127.0.0.1 to make it local only
    // or literally any 127/8 address
    interface: null,
};

// set diabled to true to disable the irc client
config.irc = {
    disabled: false,
    server: 'irc.rizon.net',
    port: 6697,
    nick: 'moose_',
    tls: true,
    nickserv_pass: '',
    channels: ['#prussian'],
    // delay per moose
    send_delay: 350, // be very careful adjusting this
    // time between moose to send
    moose_delay: 10 * 1000,
    // timeout for generating image links
    moose_image_spam: 2 * 1000,
    // timeout for .help, .source, .bots and .moose --help commands
    help_spam: 10 * 1000,
    // timeout for searching for moose or generating image links
    moose_search_spam: 10 * 1000,
    // timeout for sending a "please wait message" when
    // a moose is being drawn somewhere
    moose_please_wait_spam: 10 * 1000,
    moose_url: 'http://localhost:7512',
};

module.exports = config;
