var Hapi = require('hapi'),
    presentPackage = require('./presenters/package');
// , metrics = require('../metrics-client.js')()


module.exports = function (request, reply) {
  var getPackageFromCouch = request.server.methods.getPackageFromCouch;
  var getBrowseData = request.server.methods.getBrowseData;

  var nameInfo = parseName(request.params.package)
  var version = nameInfo.version || 'latest'

  if (nameInfo.name !== encodeURIComponent(nameInfo.name)) {
    var error = Hapi.error.badRequest('Invalid Package Name');
    error.message = "The package you have requested is an invalid package name.\n\nTry again?"

    return reply.view('error', error)
  }

  getPackageFromCouch(couchLookupName(nameInfo), function (er, pkg) {
    if (er || pkg.error) {
      var error = Hapi.error.notFound('Package Not Found');
      error.message = "This package does not exist in the registry. Would you like to claim it for yourself?"

      return reply.view('error', error)
    }

    if (pkg.time && pkg.time.unpublished) {
      // reply with unpublished package page
      // reply.view('unpublished-package-page', {
      //   package: pkg
      // })
    }

    getBrowseData('depended', nameInfo.name, 0, 1000, function (er, dependents) {
      pkg.dependents = dependents;

      presentPackage(pkg, function (er, pkg) {

        reply.view('package-page', {
          package: pkg,
          title: pkg.name
        });
      })
    })
  })
}

function parseName (params) {
  var name, version;

  if (typeof params === 'object') {
    name = params.name;
    version = params.version;
  } else {
    var p = params.split('@');
    name = p.shift();
    version = p.join('@');
  }

  version = version || '';

  return {name: name, version: version};
}

function couchLookupName (nameInfo) {
  var name = nameInfo.name;

  if (nameInfo.version) {
    name += '/' + version;
  }

  return name;
}

