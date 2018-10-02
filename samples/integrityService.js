"use strict";

const path = require("path");
const read = require("read");
const vsphere = require("../dist/vsphere");

function createSpec(service, obj, pathSet) {
   return service.vim.PropertyFilterSpec({
      objectSet: service.vim.ObjectSpec({
         obj
      }),
      propSet: [
         service.vim.PropertySpec({
            type: obj.type,
            pathSet
         })
      ]
   });
}

function sample(hostname, username, password) {
   console.log("Connecting to " + hostname + "...");
   let integrityOptions = {
      debug: false,
      definitions: ["file://" + path.join(__dirname,
            "../definitions/integrityService/integrityService.wsdl")]
   };
   Promise.all([
      vsphere.integrityService(hostname, integrityOptions),
      vsphere.vimService(hostname, {debug: false})
   ]).then(([integrityService, vimService]) => {
      let integrityServiceContent = integrityService.serviceContent;
      let integrityPropertyCollector =
            integrityServiceContent.propertyCollector;
      let integritySessionManager = integrityServiceContent.sessionManager;
      let integrityPort = integrityService.integrityPort;
      let vimPort = vimService.vimPort;
      let vimServiceContent = vimService.serviceContent;
      let vimPropertyCollector = vimServiceContent.propertyCollector;
      let vimSessionManager = vimServiceContent.sessionManager;
      vimPort.login(vimSessionManager, username, password).then((session) => {
         vimPort.retrievePropertiesEx(vimPropertyCollector, [
            createSpec(vimService, vimServiceContent.rootFolder,
                  ["childEntity"])
         ], vimService.vim.RetrieveOptions()).then(({objects}) => {
            let childEntities = objects[0].propSet[0].val;
            integrityPort.vciLogin(integritySessionManager,
                  username, session.key).then(() => {
                     return Promise.all(childEntities.map(({type, value}) => {
                        return integrityService.vim.ManagedObjectReference({
                           type, value
                        });
                     }).map((ref) => {
                        return integrityPort.getComplianceStatus(
                              integrityServiceContent.complianceStatusManager,
                              ref).then((statusCollector) => {
                                 return integrityPort.retrievePropertiesEx(
                                       integrityPropertyCollector, [
                                          createSpec(integrityService,
                                                statusCollector, ["status"])
                                       ],
                                       integrityService.vim.RetrieveOptions());
                              });
                     }));
                  }).then((statusObjects) => {
                     statusObjects.forEach(({objects}, i) => {
                        console.log(childEntities[i].value + " status:");
                        objects[0].propSet[0].val.forEach(({key, status}) => {
                           console.log(key + ": " + status);
                        });
                     });
                     return integrityPort.vciLogout(integritySessionManager);
                  });
         });
      });
   });
}

read({prompt: "Hostname: "}, (err, hostname) => {
   read({prompt: "Username: "}, (err, username) => {
      read({prompt: "Password: ", replace: "*", silent: true},
         (err, password) => sample(hostname, username, password));
   });
});
