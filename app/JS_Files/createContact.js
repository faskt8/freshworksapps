$(document).ready(function () {
  app.initialized().then(
    function (_client) {
      var createContactsClient = _client;
      $(
        "#createContactNotify,#createContactNotify1, #organisationError, #loadingMSG"
      ).hide();
      createContactsClient.instance.context().then(
        function (data) {
          console.log("contact data ", data);
          createContactsClient.iparams.get().then(
            function (idata) {
              let contactPersonMappingsArr = idata.selectedFields1;
              let contactData = data.data.contactData.contact;
              let contactDataCustomFields = contactData.custom_fields;
              let arr = [];
              for (contactPersonField of contactPersonMappingsArr) {
                let obj = {};
                let contactFreshdeskID = contactPersonField.FDCompanyFieldVal;
                let pipeFieldID = contactPersonField.pipeFieldVal;
                let reqVal;
                if (
                  contactData[contactFreshdeskID] != undefined &&
                  contactData[contactFreshdeskID] != null
                ) {
                  reqVal = contactData[contactFreshdeskID];
                } else if (
                  contactDataCustomFields != null &&
                  contactDataCustomFields != undefined &&
                  contactDataCustomFields[contactFreshdeskID] != undefined &&
                  contactDataCustomFields[contactFreshdeskID] != null
                ) {
                  reqVal = contactDataCustomFields[contactFreshdeskID];
                }
                if (reqVal != "" && reqVal != undefined && reqVal != null) {
                  if (
                    pipeFieldID == "name" ||
                    pipeFieldID == "phone" ||
                    pipeFieldID == "email"
                  ) {
                    obj[pipeFieldID] = reqVal;
                    arr.push(obj);
                  } else {
                    let newReqVal = `${reqVal}=${pipeFieldID}`;
                    arr.push(newReqVal);
                  }
                }
              }
              let other_emails = contactData.other_emails;
              if (other_emails.length > 0) {
                for (otherEmail of other_emails) {
                  let obj = {};
                  obj["email"] = otherEmail;
                  arr.push(obj);
                }
              }
              console.log("arr ", arr);
              $("#loadingMSG").show().text("Loading Please Wait...");
              $("#page1").hide();
              let name = "",
                phone = "",
                email = "",
                mdmID = "",
                companyName;
              for (let i = 0; i < arr.length; i++) {
                console.log('arr[i]["phone"] ', arr[i]["phone"]);
                if (arr[i]["name"] != undefined && arr[i]["name"] != null) {
                  name += `${arr[i]["name"]}`;
                } else if (
                  arr[i]["phone"] != undefined &&
                  arr[i]["phone"] != null
                ) {
                  phone += `${arr[i]["phone"]},`;
                } else if (
                  arr[i]["email"] != undefined &&
                  arr[i]["email"] != null
                ) {
                  email += `${arr[i]["email"]},`;
                } else {
                  mdmID += `${arr[i]}`;
                }
              }
              console.log(name, email, phone, mdmID);
              let companyName1 = data.data.companyData;
              if (companyName1 != undefined && companyName1 != null) {
                companyName = data.data.companyData.company.name;
              }
              $("#nameCreate").val(name);
              $("#phoneCreate").val(phone);
              $("#emailCreate").val(email);
              $("#mdmCreate").val(mdmID);
              if (companyName === "NA") {
                $("#organisationCreate").val(" ");
                $("#organisationCreate").prop("disabled", true);
                $("#organisationError")
                  .show()
                  .html(
                    "There is no company associated with this contact in Freshdesk."
                  );
                $("#loadingMSG").hide().text("");
                $("#page1").show();
              } else {
                $("#organisationCreate").val(companyName);
                $("#organisationCreate").prop("disabled", true);
                $("#loadingMSG").hide().text("");
                $("#page1").show();
              }
            },
            function () {
              $("#createContactNotify")
                .show()
                .html("Unexpected error occurred, please try after sometime.");
            }
          );
        },
        function () {
          $("#createContactNotify")
            .show()
            .html("Unexpected error occurred, please try after sometime.");
        }
      );
      // create contact button click function
      $("#createContactButton").click(function () {
        $("#createContactButton").text("Creating...").prop("disabled", true);
        $("#createContactNotify").hide();
        checkNameEmailPhoneFields(createContactsClient);
      });
      // requester name, phone, email create click function
      $("#nameCreate, #phoneCreate, #emailCreate, #organisationCreate").click(
        function () {
          $(
            "#nameError, #phoneError, #emailError, #createContactNotify, #phoneErrorDiv"
          ).html("");
          enableButton();
        }
      );
    },
    function () {
      $("#createContactNotify")
        .show()
        .html("Unexpected error occurred, please try after sometime.");
      closeModal(_client);
    }
  );
  // checking if the name, emailID, org_name and phone number is present
  function checkNameEmailPhoneFields(createContactsClient) {
    let nameValue = $("#nameCreate").val();
    let phoneValue = $("#phoneCreate").val();
    let emailValue = $("#emailCreate").val();
    let mdmCreate = $("#mdmCreate").val();
    let mdmPipeID = mdmCreate.split("=")[1];
    let mdmPipeVal = mdmCreate.split("=")[0];
    let fieldValueObj;
    console.log("phoneValue == >> ", phoneValue);
    if (mdmCreate != "" && mdmCreate != undefined && mdmCreate != null) {
      fieldValueObj = {
        requesterName: nameValue,
        requesterPhone: phoneValue,
        requesterEmail: emailValue,
        mdmPipeID: mdmPipeID,
        mdmPipeVal: mdmPipeVal,
      };
    } else {
      fieldValueObj = {
        requesterName: nameValue,
        requesterPhone: phoneValue,
        requesterEmail: emailValue,
      };
    }

    console.log("fieldValueObj == >> ", fieldValueObj);
    // to check if the value is present in both input blocks
    if (nameValue === "" || emailValue === "") {
      if (nameValue === "") {
        $("#nameError").show().html("This field is required.");
        enableButton();
      }
      if (emailValue === "") {
        $("#emailError").show().html("This field is required.");
        enableButton();
      }
    } else {
      verification(createContactsClient, fieldValueObj);
    }
  }
  // to verify the email and phone
  function verification(createContactsClient, fieldValueObj) {
    getContactData(createContactsClient, fieldValueObj);
  }
  //  to create a new contact
  function getContactData(createContactsClient, fieldValueObj) {
    console.log("in getContactData function");
    createContactsClient.instance.context().then(
      function (data) {
        var companyID;
        var companyID1 = data.data.companyData;
        if (companyID1 != undefined && companyID1 != null) {
          companyID = data.data.companyData.company.id;
        }
        $("#organisationError").hide().html("");
        var companyName = $("#organisationCreate").val();
        if (
          companyName == " " ||
          companyName == "" ||
          companyName == undefined ||
          companyName == null
        ) {
          var options = {
            name: btoa(fieldValueObj.requesterName),
            phone: btoa(fieldValueObj.requesterPhone),
            email: btoa(fieldValueObj.requesterEmail),
            pipedriveMDMVal: fieldValueObj.mdmPipeVal,
            pipedriveMDMID: fieldValueObj.mdmPipeID,
          };
          createAContactInPipedrive(
            createContactsClient,
            options,
            fieldValueObj
          );
        } else {
          checkIfOrganisationPresent(
            createContactsClient,
            companyName,
            companyID,
            fieldValueObj
          );
        }
      },
      function () {
        $("#createContactNotify")
          .show()
          .html("Unexpected error occurred, please try after sometime.");
      }
    );
  }
  // create a organisation
  function checkIfOrganisationPresent(
    createContactsClient,
    companyName,
    companyID,
    fieldValueObj
  ) {
    console.log("in checkIfOrganisationPresent function");
    var options = {
      companyName: btoa(companyName),
      companyID: companyID,
    };
    console.log("options ", options, fieldValueObj);
    createContactsClient.request.invoke("checkOrganisation", options).then(
      function (data) {
        let companyID = data.response;
        console.log("companyID", companyID);
        var options = {
          name: btoa(fieldValueObj.requesterName),
          phone: btoa(fieldValueObj.requesterPhone),
          email: btoa(fieldValueObj.requesterEmail),
          companyName: companyName,
          companyID: btoa(companyID),
          pipedriveMDMVal: fieldValueObj.mdmPipeVal,
          pipedriveMDMID: fieldValueObj.mdmPipeID,
        };
        createAContactInPipedrive(createContactsClient, options, fieldValueObj);
      },
      function () {
        $("#createContactNotify")
          .show()
          .html("Failed to create organisation..!");
        enableButton();
      }
    );
  }
  // function to create a new contact in pipedrive
  function createAContactInPipedrive(
    createContactsClient,
    options,
    fieldValueObj
  ) {
    console.log("in createAContactInPipedrive function ", options);
    createContactsClient.request.invoke("createPerson", options).then(
        function () {
        console.log("Successssssssssss")
        $("#page1").hide();
        $("#createContactNotify1")
          .show()
          .html("Contact created successfully in pipedrive..!");
        createContactsClient.instance.send({
          message: {
            email: fieldValueObj.requesterEmail,
          },
        });
        closeModal(createContactsClient);
      },
        function (error) {
         console.log(error)
        $("#createContactNotify").show().html("Failed to create contact..!");
        enableButton();
      }
    );
  }

  function enableButton() {
    $("#createContactButton").text("Create");
    $("#createContactButton").prop("disabled", false);
  }
});
