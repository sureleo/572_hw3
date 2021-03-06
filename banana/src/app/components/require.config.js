/**
 * Bootstrap require with the needed config, then load the app.js module.
 */
require.config({
  baseUrl: 'app',
  // urlArgs: 'r=@REV@',
  paths: {
    config:                   '../config',
    settings:                 'components/settings',
    kbn:                      'components/kbn',

    css:                      '../vendor/require/css',
    text:                     '../vendor/require/text',
    moment:                   '../vendor/moment',
    filesaver:                '../vendor/filesaver',

    angular:                  '../vendor/angular/angular',
    'angular-dragdrop':       '../vendor/angular/angular-dragdrop',
    'angular-strap':          '../vendor/angular/angular-strap',
    'angular-sanitize':       '../vendor/angular/angular-sanitize',
    timepicker:               '../vendor/angular/timepicker',
    datepicker:               '../vendor/angular/datepicker',

    underscore:               'components/underscore.extended',
    'underscore-src':         '../vendor/underscore',
    bootstrap:                '../vendor/bootstrap/bootstrap',

    jquery:                   '../vendor/jquery/jquery-1.8.0',
    'jquery-ui':              '../vendor/jquery/jquery-ui-1.10.3',

    'extend-jquery':          'components/extend-jquery',

    'jquery.flot':            '../vendor/jquery/jquery.flot',
    'jquery.flot.pie':        '../vendor/jquery/jquery.flot.pie',
    'jquery.flot.selection':  '../vendor/jquery/jquery.flot.selection',
    'jquery.flot.stack':      '../vendor/jquery/jquery.flot.stack',
    'jquery.flot.stackpercent':'../vendor/jquery/jquery.flot.stackpercent',
    'jquery.flot.time':       '../vendor/jquery/jquery.flot.time',
    'jquery.flot.axislabels': '../vendor/jquery/jquery.flot.axislabels',
    'showdown':               '../vendor/showdown',

    modernizr:                '../vendor/modernizr-2.6.1',
    elasticjs:                '../vendor/elasticjs/elastic-angular-client',
    solrjs:                   '../vendor/solrjs/solr-angular-client',
    d3:                       '../vendor/d3',
    'd3.geo.projection':      '../vendor/d3.geo.projection.v0.min',
    'd3.tip':                 '../vendor/d3.tip.v0.6.3',
    topojson:                 '../vendor/topojson.v1.min'
  },
  shim: {
    underscore: {
      exports: '_'
    },

    angular: {
      deps: ['jquery'],
      exports: 'angular'
    },

    bootstrap: {
      deps: ['jquery']
    },

    modernizr: {
      exports: 'Modernizr'
    },

    jquery: {
      exports: 'jQuery'
    },

    d3: {
      exports: 'd3'
    },

    topojson: {
      deps: ['d3'],
      exports: 'topojson'
    },

    // simple dependency declaration
    'd3.tip':               ['d3'],
    'jquery-ui':            ['jquery'],
    'jquery.flot':          ['jquery'],
    'jquery.flot.pie':      ['jquery', 'jquery.flot'],
    'jquery.flot.selection':['jquery', 'jquery.flot'],
    'jquery.flot.stack':    ['jquery', 'jquery.flot'],
    'jquery.flot.stackpercent':['jquery', 'jquery.flot'],
    'jquery.flot.time':     ['jquery', 'jquery.flot'],
    'jquery.flot.axislabels':['jquery', 'jquery.flot'],

    'angular-sanitize':     ['angular'],
    'angular-cookies':      ['angular'],
    'angular-dragdrop':     ['jquery','jquery-ui','angular'],
    'angular-loader':       ['angular'],
    'angular-mocks':        ['angular'],
    'angular-resource':     ['angular'],
    'angular-route':        ['angular'],
    'angular-touch':        ['angular'],

    'angular-strap':        ['angular', 'bootstrap','timepicker', 'datepicker'],

    'd3.geo.projection':    ['d3'],

    timepicker:             ['jquery', 'bootstrap'],
    datepicker:             ['jquery', 'bootstrap'],

    elasticjs:              ['angular', '../vendor/elasticjs/elastic'],
    solrjs:                 ['angular', '../vendor/solrjs/solr']
  }
});
