let config = void 0,
  streetartModel = void 0,
  docDropzone = void 0,
  imageDropzone = void 0,
  thisForm = void 0;

let repo = "streetart";
const form_id = "streetart";
const app_container_id = ".streetart_public_container";
let httpHost, mailSend;
let fid = null;

$(function () {
  httpHost = '/* @echo ENV*/';

  let cotApp = new CotApp();

  //@if ENV='local'
  cotApp.appContentKeySuffix = '';
  //@endif

  cotApp.loadAppContent({
    keys: ['streetart_config'],
    onComplete: function (data) {
      let key = "streetart_config";
      //@if ENV='local'
      config = JSON.parse(data[key]);
      //@endif
      //@if ENV!='local'
      config = data[key];
      //@endif

      thisForm.render($(app_container_id));
      initForm();
    }
  });

  //Using CotModel, which extends Backbone.Model, to manage data models
  streetartModel = new CotModel({
    "FirstName": "",
    "LastName": "",
    "ArtistAlias": "",
    "Organization": "",
    "PreferredContactName": "",
    "OrganizationDescription": "",
    "Address": "",
    "City": "",
    "Province": "",
    "PostalCode": "",
    "PrimaryPhone": "",
    "OtherPhone": "",
    "Email": "",
    "URL": "",
    "ContactMethod": "",
    "WorkToPublic": "",
    "Profile": "",
    "IntNavail": "",
    "Exp": "",
    "WorkHistory": "",
    "chkCV": "",
    "document_dropzone": [],
    "image_dropzone": [],
    "chkDeclaration": "",
    "fid": "",
    "action": "",
    "createdBy": "",
    "recCreated": "",
    "lstStatus": ""
  });

  //Using CotForm to create forms. Form class is an example that
  //uses a custom subclass of CotView, which extends Backbone.view, to manage a CotForm instance
  thisForm = new streetartForm({
    id: form_id,
    title: 'Artist Profile', //config["Form Title"],
    model: streetartModel
  });

  function initForm() {
    repo = config.default_repo ? config.default_repo : repo;
    mailSend = config.messages.notify.sendNotification ? config.messages.notify.sendNotification : false;

    docDropzone = new Dropzone("div#document_dropzone", $.extend(config.admin.docDropzonePublic, {
      "dz_id": "document_dropzone", "fid": fid, "form_id": form_id,
      "url": config.httpHost.app_public[httpHost] + config.api_public.upload + config.default_repo + '/' + repo,
    }));

    imageDropzone = new Dropzone("div#image_dropzone", $.extend(config.admin.imageDropzonePublic, {
      "dz_id": "image_dropzone", "fid": fid, "form_id": form_id,
      "url": config.httpHost.app_public[httpHost] + config.api_public.upload + config.default_repo + '/' + repo,
    }))

    // prepares dz fields for AODA
    $(".dz-hidden-input").attr("aria-hidden", "true");
    $(".dz-hidden-input").attr("aria-label", "File Upload Control");

    $("#printbtn").click(function () { window.print(); });

    // removes the word (optional) added by the main core functionality from required keywords
    // current core code doesn't recognize the validatros, put (optional) word to the label 
    // if the required keyword is not set to true
    $('input[name="PreferredContactName"]').change(function () {
      let checkedVal = $('input[name="PreferredContactName"]:checked').val();
      switch (checkedVal) {
        case "Full Name":
          $("#FirstNameElement .optional").first().text("");
          $("#LastNameElement .optional").first().text("");
          $("#ArtistAliasElement .optional").first().text("(optional)");
          $("#OrganizationElement .optional").first().text("(optional)");
          break;
        case "Artist Alias":
          $("#ArtistAliasElement .optional").first().text("");
          $("#FirstNameElement .optional").first().text("(optional)");
          $("#LastNameElement .optional").first().text("(optional)");
          $("#OrganizationElement .optional").first().text("(optional)");
          break;
        case "Business":
          $("#OrganizationElement .optional").first().text("");
          $("#FirstNameElement .optional").first().text("(optional)");
          $("#LastNameElement .optional").first().text("(optional)");
          $("#ArtistAliasElement .optional").first().text("(optional)");
          break;
        default:
      }

      // revalidates the fields related with PreferredContactName parameter
      $('#' + form_id).formValidation('revalidateField', $('#FirstName'));
      $('#' + form_id).formValidation('revalidateField', $('#LastName'));
      $('#' + form_id).formValidation('revalidateField', $('#ArtistAlias'));
      $('#' + form_id).formValidation('revalidateField', $('#Organization'));
    });

    // removes the word (optional) added by the main core functionality from required keywords
    $('input[name="ContactMethod"]').change(function () {
      let checkedVal = $('input[name="ContactMethod"]:checked').val();
      switch (checkedVal) {
        case "Phone":
          $("#AddressElement .optional").first().text("(optional)");
          $("#CityElement .optional").first().text("(optional)");
          $("#ProvinceElement .optional").first().text("(optional)");
          $("#PrimaryPhoneElement .optional").first().text("");
          $("#EmailElement .optional").first().text("(optional)");
          break;
        case "Email":
          $("#AddressElement .optional").first().text("(optional)");
          $("#CityElement .optional").first().text("(optional)");
          $("#ProvinceElement .optional").first().text("(optional)");
          $("#PrimaryPhoneElement .optional").first().text("(optional)");
          $("#EmailElement .optional").first().text("");
          break;
        case "Mail":
          $("#AddressElement .optional").first().text("");
          $("#CityElement .optional").first().text("");
          $("#ProvinceElement .optional").first().text("");
          $("#PrimaryPhoneElement .optional").first().text("(optional)");
          $("#EmailElement .optional").first().text("(optional)");
          break;
        default:
      }

      // revalidates the fields related with ContactMethod parameter
      $('#' + form_id).formValidation('revalidateField', $('#Address'));
      $('#' + form_id).formValidation('revalidateField', $('#City'));
      $('#' + form_id).formValidation('revalidateField', $('#Province'));
      $('#' + form_id).formValidation('revalidateField', $('#PrimaryPhone'));
      $('#' + form_id).formValidation('revalidateField', $('#Email'));
    });
  }
  function countChar(fieldToCount)
  {
    if(fieldToCount.value.length > 500)
    {
      memofield.value = memofield.value.slice(0,500)
    }
    
  }

});