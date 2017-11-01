streetartForm = CotView.extend({
  initialize: function initialize() {
  },
  render: function (container) {
    container.append(this.el);
    this._form = new CotForm(this.formDefinition());
    this._form.render({ target: this.el });
    this._form.setModel(this.model);
    return this;
  },
  formDefinition: function () {
    return {
      id: this.id,
      title: this.title,
      rootPath: '/resources/streetart_public/',
      success: function success() {
        var payload = streetartModel.toJSON();

        var dataCreated = new Date();
        payload.recCreated = dataCreated;
        payload.lstStatus = config.status.DraftApp;

        let PreferredContactName = displayPreferred(payload);
        payload.displayPreferredContactName = PreferredContactName;

        // Gets all the info for uploads to payroll
        payload.doc_uploads = processUploads(docDropzone, repo, false);
        payload.image_uploads = processUploads(imageDropzone, repo, false);

        let uploads = (payload.image_uploads).concat(payload.doc_uploads);
        let keepQueryString = checkFileUploads(uploads);

        $.ajax({
          "url": config.httpHost.app_public[httpHost] + config.api_public.post + repo + '?sid=' + keepQueryString,
          type: 'POST',
          "data": JSON.stringify(payload),
          "headers": {
            'Content-Type': 'application/json; charset=utf-8;',
            'Cache-Control': 'no-cache'
          },
          "datatype": 'json',
          "success": function (data) {
            if ((data.EventMessageResponse.Response.StatusCode) == 200) {
              scroll(0, 0);
              $(app_container_id).html(config.messages.submit.done);
              //bootbox.alert(config.messages.submit.done);
              if (mailSend) {
                emailNotice(data.EventMessageResponse.Event.EventID, 'notify',PreferredContactName);
              }
            }
          },
          "error": function () {
            $('#successFailArea').html(config.messages.submit.fail);
            bootbox.alert(config.messages.submit.fail);
          }
        }).done(function () {
        });

      },

      "useBinding": true,
      "sections": getSubmissionSections()
    }

  }
});

function displayPreferred(formData) {
  switch (formData.PreferredContactName) {
    case 'Full Name':
      return formData.FirstName + " " + formData.LastName;
    case 'Artist Alias':
      return formData.ArtistAlias;
    case 'Business':
      return formData.Organization;
    default:
      return '';
  }
}

function getSubmissionSections() {
  let section = [
    {
      id: "contactSec",
      title: config["Contact Details Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            {
              id: "FirstName",
              bindTo: "FirstName",
              title: config["First Name"],
              className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="PreferredContactName"]:checked').val();
                    return ((checkVal !== "Full Name") ? true : (value !== ''));
                  }
                }
              }
            },
            {
              id: "LastName",
              bindTo: "LastName",
              title: config["Last Name"],
              className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="PreferredContactName"]:checked').val();
                    return ((checkVal !== "Full Name") ? true : (value !== ''));
                  }
                }
              }
            }]
        }, {
          fields: [
            {
              id: "ArtistAlias",
              bindTo: "ArtistAlias",
              title: config["Artist Alias"],
              className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="PreferredContactName"]:checked').val();
                    return ((checkVal !== "Artist Alias") ? true : (value !== ''));
                  }
                }
              }
            },
            {
              id: "Organization",
              bindTo: "Organization",
              title: config["Organization"],
              className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="PreferredContactName"]:checked').val();
                    return ((checkVal !== "Business") ? true : (value !== ''));
                  }
                }
              }
            }]
        }, {
          fields: [
            {
              id: "PreferredContactName",
              bindTo: "PreferredContactName",
              required: true,
              title: config["Preferred Name"],
              type: "radio", className: "col-xs-12 col-md-6",
              choices: config.preferredName.choices,
              orientation: "horizontal",
              prehelptext: config["PreferredNameText"]
            }
          ]
        }, {
          fields: [
            {
              id: "OrganizationDescription",
              bindTo: "OrganizationDescription",
              title: config["Artist Bio"],
              type: "textarea",
              className: "col-xs-12 col-md-12",
              htmlAttr: { maxLength: 500 }
            },
            {
              id: "Address",
              bindTo: "Address",
              title: config["Address"],
              className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="ContactMethod"]:checked').val();
                    return ((checkVal !== "Mail") ? true : (value !== ''));
                  }
                }
              }
            },
            {
              id: "City",
              bindTo: "City",
              title: config["City"],
              value: "Toronto",
              className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="ContactMethod"]:checked').val();
                    return ((checkVal !== "Mail") ? true : (value !== ''));
                  }
                }
              }
            }]
        }, {
          fields: [
            {
              id: "Province",
              bindTo: "Province",
              title: config["Province"],
              value: "Ontario",
              className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="ContactMethod"]:checked').val();
                    return ((checkVal !== "Mail") ? true : (value !== ''));
                  }
                }
              }
            },
            {
              id: "PostalCode",
              bindTo: "PostalCode",
              title: config["Postal Code"],
              validationtype: "PostalCode",
              className: "col-xs-12 col-md-6"
            }]
        }, {
          fields: [
            {
              id: "PrimaryPhone",
              bindTo: "PrimaryPhone",
              title: config["Primary Phone"],
              validationtype: "Phone",
              className: "col-xs-12 col-md-6",
              required: "true",
              /*   validators: {
                   callback: {
                     callback: function (value, validator, $field) {
                       var checkVal = $('input[name="ContactMethod"]:checked').val();
                       return ((checkVal !== "PrimaryPhone") ? true : (value !== ''));
                     }
                   }
                 }*/
            },
            { id: "OtherPhone", bindTo: "OtherPhone", title: config["Other Phone"], validationtype: "Phone", className: "col-xs-12 col-md-6" }]
        }, {
          fields: [
            {
              id: "Email",
              bindTo: "Email",
              title: config["Email"],
              validationtype: "Email",
            //  validators: { regexp: { regexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, message: 'This field must be a valid email. (###@###.####)' } }, className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="ContactMethod"]:checked').val();
                    return ((checkVal !== "Email") ? true : (value !== ''));
                  }
                }
              }
            },
            {
              id: "URL",
              bindTo: "URL",
              validationtype: "URL",
              title: config["URL"],
              value: "http://", className: "col-xs-12 col-md-6"
            }
          ]
        }, {
          fields: [
            {
              id: "ContactMethod",
              bindTo: "ContactMethod",
              required: true,
              title: config["preferredMethodTitle"],
              type: "radio",
              choices: config.preferredMethod.choices,
              orientation: "horizontal",
              className: "col-xs-12 col-md-6"
            }
          ]
        }]
    },
    {
      id: "workSec",
      title: config["Work Details Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            { id: "workToPublicText", title: "", type: "html", html: config["WorkToPublicText"], className: "col-xs-12 col-md-12" },
            { id: "WorkToPublic", bindTo: "WorkToPublic", required: true, orientation: "horizontal", title: config["Work To Public"], type: "radio", value: "", choices: config.choices.yesNoFull, className: "col-xs-12 col-md-6" },
            { id: "Profile", bindTo: "Profile", prehelptext: config["ProfileText"], title: config["Profile"], type: "textarea", className: "col-xs-12 col-md-12" },
            { id: "IntNavail", bindTo: "IntNavail", title: config["Availability"], type: "textarea", className: "col-xs-12 col-md-12" },
            { id: "Exp", bindTo: "Exp", title: config["Experience"], type: "textarea", className: "col-xs-12 col-md-12" },
            { id: "WorkHistory", bindTo: "WorkHistory", title: config["Work History"], type: "textarea", className: "col-xs-12 col-md-12" }
          ]
        }
      ]
    },
    {
      id: "cvSec",
      title: config["CV Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            { id: "chkCV", bindTo: "chkCV", title: config["chkCVAvailable"], "required": true, type: "radio", choices: config.choices.yesNoFull, orientation: "horizontal", className: "col-xs-12 col-md-6" },
            { id: "CV", title: config["CV"], type: "html", "aria-label": "Dropzone File Upload Control Field for Resume", html: '<section aria-label="File Upload Control Field for Resume" id="document_attachments"> <div class="dropzone" id="document_dropzone" aria-label="Dropzone File Upload Control for Resume Section"></div></section>', className: "col-xs-12 col-md-12" }
          ]
        }]
    },
    {
      id: "imageSec",
      title: config["Images Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            { id: "Images", prehelptext: config["ImagesText"], title: config["Images"], type: "html", "aria-label": "Dropzone File Upload Control Field for Images", html: '<section aria-label="File Upload Control Field for Images" id="image_attachments"> <div class="dropzone" id="image_dropzone" aria-label="Dropzone File Upload Control for Images Section"></div></section>', className: "col-xs-12 col-md-12" },
            { id: "FooterText1", title: "", type: "html", html: config["FooterText1"], className: "col-xs-12 col-md-12" },
            { id: "FooterText2", title: "", type: "html", html: config["FooterText2"], className: "col-xs-12 col-md-12" },
            { id: "FooterText3", title: "", type: "html", html: config["FooterText3"], className: "col-xs-12 col-md-12" },
            {
              id: "chkDeclaration", bindTo: "chkDeclaration", title: "", type: "radio", choices: config.chkDeclaration.choices, orientation: "horizontal", className: "col-xs-12 col-md-12",
              validators: {
                callback: {
                  "message": config["declarationValidation"],
                  callback: function (value, validator, $field) {
                    return $field[0].checked;
                  }
                }
              }
            },
            { id: "submitHelp", title: "", type: "html", html: config["SubmitText"], className: "col-xs-12 col-md-12" },
            {
              id: "actionBar",
              type: "html",
              html: `<div className="col-xs-12 col-md-12"><button class="btn btn-success" id="savebtn"><span class="glyphicon glyphicon-send" aria-hidden="true"></span> ` + config.button.submitReport + `</button>
                     <button class="btn btn-success" id="printbtn"><span class="glyphicon glyphicon-print" aria-hidden="true"></span>Print</button></div>`
            },
            { id: "successFailRow", type: "html", className: "col-xs-12 col-md-12", html: `<div id="successFailArea" className="col-xs-12 col-md-12"></div>` },
            { id: "fid", type: "html", html: "<input type=\"text\" id=\"fid\" aria-label=\"Document ID\" aria-hidden=\"true\" name=\"fid\">", class: "hidden" },
            { id: "action", type: "html", html: "<input type=\"text\" id=\"action\" aria-label=\"Action\" aria-hidden=\"true\" name=\"action\">", class: "hidden" },
            { id: "createdBy", type: "html", html: "<input type=\"text\" id=\"createdBy\" aria-label=\"Record Created By\" aria-hidden=\"true\" name=\"createdBy\">", class: "hidden" },
            { id: "recCreated", type: "html", html: "<input type=\"text\" id=\"recCreated\" aria-label=\"Record Creation Date\" aria-hidden=\"true\" name=\"recCreated\">", class: "hidden" },
            { id: "lstStatus", type: "html", html: "<input type=\"hidden\" aria-label=\"Record Status\" aria-hidden=\"true\" id=\"lstStatus\" name=\"lstStatus\">", class: "hidden" }
          ]
        }
      ]
    }
  ]
  return section;
}
function processUploads(DZ, repo, sync) {
  let uploadFiles = DZ.existingUploads ? DZ.existingUploads : new Array;
  let _files = DZ.getFilesWithStatus(Dropzone.SUCCESS);
  let syncFiles = sync;
  if (_files.length == 0) {
    //empty
  } else {
    $.each(_files, function (i, row) {
      let json = JSON.parse(row.xhr.response);
      json.name = row.name;
      json.type = row.type;
      json.size = row.size;
      json.bin_id = json.BIN_ID[0];
      delete json.BIN_ID;
      uploadFiles.push(json);
      syncFiles ? '' : '';
    });
  }
  return uploadFiles;
}
function checkFileUploads(uploads) {
  let queryString = "";
  let binLoc = "";

  if (uploads.length > 0) {
    $.each(uploads, function (index, item) {
      if (binLoc == "") {
        binLoc = item.bin_id;
      } else {
        binLoc = binLoc + "," + item.bin_id;
      }
    })
  }

  if (binLoc != "") { queryString = "&keepFiles=" + binLoc };

  return queryString;
}
function emailNotice(fid, action, PreferredContactName) {
  let emailTo = {};
  let emailCaptain = config.captain_emails[httpHost];
  let emailAdmin = config.admin_emails[httpHost];
  (typeof emailCaptain !== 'undefined' && emailCaptain != "") ? $.extend(emailTo, emailCaptain) : "";
  (typeof emailAdmin !== 'undefined' && emailAdmin != "") ? $.extend(emailTo, emailAdmin) : "";

  var emailRecipients = $.map(emailTo, function (email) {
    return email;
  }).filter(function (itm, i, a) {
    return i === a.indexOf(itm);
  }).join(',');

  var payload = JSON.stringify({
    'emailTo': emailRecipients,
    'emailFrom': (config.messages.notify.emailFrom ? config.messages.notify.emailFrom : 'wmDev@toronto.ca'),
    'id': fid,
    'status': action,
    'body': (config.messages.notify.emailBody ? config.messages.notify.emailBody : 'New submission by "' + PreferredContactName + '" has been received.'),
    'emailSubject': (config.messages.notify.emailSubject ? config.messages.notify.emailSubject : 'New submission')
  });

  $.ajax({
    url: config.httpHost.app_public[httpHost] + config.api_public.email,
    type: 'POST',
    data: payload,
    headers: {
      'Content-Type': 'application/json; charset=utf-8;',
      'Cache-Control': 'no-cache'
    },
    "datatype": 'json'
  }).done(function (data, textStatus, jqXHR) {
  }).fail(function (jqXHR, textStatus, error) {
    console.log("POST Request Failed: " + textStatus + ", " + error);
  });
}