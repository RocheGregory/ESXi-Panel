$(function() {

   "use strict";

   function getCookie(name) {
      var re = RegExp("(?:^|;\\s*)" + name + "=([^;]*)");
      var match = document.cookie.match(re);
      return match ? match[1] : undefined;
   }

   function setCookie(name, value) {
      document.cookie = name + "=" +
            (value !== undefined ? value : ";expires=" + new Date(0));
   }

   function hideAlert() {
      alert.addClass("hide");
   }

   function showAlert(message) {
      alert.html(message);
      alert.removeClass("hide");
   }

   function showSession() {
      session.removeClass("hide");
   }

   function toggleSession() {
      session.find("input").each(function() {
         var el = $(this);
         if (el.attr("type") == "submit") {
            var value = el.val();
            el.removeAttr("disabled");
            el.val(el.data("alt"));
            el.data("alt", value);
         } else {
            el.toggle();
         }
      });
   }

   function hideContent() {
      content.empty();
   }

   function showContent() {
      var vim = service.vim;
      var vimPort = service.vimPort;
      var propertyCollector = service.serviceContent.propertyCollector;
      var rootFolder = service.serviceContent.rootFolder;
      var viewManager = service.serviceContent.viewManager;
      var type = "ClusterComputeResource";
      return vsphere.vsanhealthService(cookie, $.extend(serviceOptions, {
         definitions: ["/definitions/vsanhealthService/vsanhealthService.wsdl"]
      })).then(function(vsanhealthService) {
         return vimPort.createContainerView(viewManager, rootFolder,
               [type], true).then(function(containerView) {
                  return vimPort.retrievePropertiesEx(propertyCollector, [
                     vim.PropertyFilterSpec({
                        objectSet : vim.ObjectSpec({
                           obj: containerView,
                           skip: true,
                           selectSet: vim.TraversalSpec({
                              path: "view",
                              type: "ContainerView"
                           })
                        }),
                        propSet: vim.PropertySpec({
                           type: type,
                           pathSet: ["configurationEx", "name"]
                        })
                     })
                  ], vim.RetrieveOptions());
               }).then(function(result) {
                  console.log(result);

                  Promise.all(result.objects.filter(function(object) {
                     return object.propSet[0].val.vsanConfigInfo.enabled;
                  }).map(function(object) {
                     var vim = vsanhealthService.vim;
                     var vsanhealthPort = vsanhealthService.vsanhealthPort;

                     var ref = vim.ManagedObjectReference({
                        type: "VsanVcClusterHealthSystem",
                        value: "vsan-cluster-health-system"
                     });
                     var cluster = vim.ManagedObjectReference({
                        type: object.obj.type,
                        value: object.obj.value
                     });
                     return vsanhealthPort.vsanQueryVcClusterHealthSummary(ref,
                           cluster, null, null, true).then(function(summary) {
                              var name = object.propSet[1].val;
                              var head = "<h3>" + name + "</h3>";
                              return head + summary.groups.map(function(group) {
                                 var tests = group.groupTests;
                                 var rows = tests.map(function(test) {
                                    return "<tr>" +
                                          "<td>" + test.testName + "</td>" +
                                          "<td>" + test.testHealth + "</td>" +
                                          "</tr>";
                                 }).join("");
                                 return "<table class=\"table\">" +
                                       "<tr>" +
                                       "<th width=\"70%\">" +
                                       group.groupName +
                                       "</th>" +
                                       "<th width=\"30%\">" +
                                       group.groupHealth +
                                       "</th>" +
                                       "</tr>" +
                                       rows +
                                       "</table>";
                              }).join("");
                           });
                  })).then(function(summaries) {
                     content.html(summaries.reduce(function(previous, current) {
                        return previous + current;
                     }, "<h2>" + cookie + "</h2>"));
                  });
               });
      });
   }

   var alert = $(".alert");
   var content = $(".content");
   var cookieKey = "hostname";
   var cookie = getCookie(cookieKey);
   var service;
   var serviceOptions = {
      proxy: true
   };
   var session = $(".session");
   session.on("submit", function(evt) {
      evt.preventDefault();
      hideAlert();
      var submit = $("[name='submit']");
      submit.attr("disabled", true);
      if (cookie !== undefined && service !== undefined) {
         service.vimPort.logout(service.serviceContent.sessionManager).
               then(function() {
                  hideContent();
                  toggleSession();
                  setCookie(cookieKey);
                  cookie = undefined;
                  service = undefined;
               });
      } else {
         var hostname = $("[name='hostname']").val();
         var username = $("[name='username']").val();
         var password = $("[name='password']").val();
         return vsphere.vimService(hostname, serviceOptions).
               then(function(vimService) {
                  service = vimService;
                  service.vimPort.login(service.serviceContent.sessionManager,
                        username, password).then(function() {
                           cookie = hostname;
                           setCookie(cookieKey, cookie);
                           toggleSession();
                           showSession();
                           return showContent();
                        }, function(err) {
                           submit.removeAttr("disabled");
                           showAlert(err.message);
                        });
               }, function(err) {
                  submit.removeAttr("disabled");
                  showAlert(err.message);
               });
      }
   });

   if (cookie !== undefined) {
      vsphere.vimService(cookie, serviceOptions).then(function(vimService) {
         service = vimService;
         return showContent();
      }).then(function() {
         showSession();
         toggleSession();
      }, function(err) {
         showSession();
         if (err.info instanceof service.vim.NotAuthenticated) {
            setCookie(cookieKey);
            cookie = undefined;
         } else {
            toggleSession();
         }
         showAlert(err.message);
      });
   } else {
      showSession();
   }

});
