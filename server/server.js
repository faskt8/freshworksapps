var reqData = require("./lib/request_data");
var request = require("request");
var base64 = require("base-64");
exports = {
  updateDealAfterWon: function (args) {
    updateDealStatusInPipedrive(args);
  },
  getAllProductsUsingfFilter: function (args) {
    getTheList(args);
  },
  productDetails: function (args) {
    getProductDetails(args);
  },
  getAllCurrencies: function (args) {
    getListOfCurrency(args);
  },
  checkOrganisation: function (args) {
    console.log("checkOrganisation function");
    getCompanyFieldValue(args);
  },
  createPerson: function (args) {
    console.log("in createPerson function");
    request(reqData.createPerson(args), function (err, resp, body) {
        if (err) {
            console.log(err);
            renderData(err);
        } else {
            console.log(resp.statusCode);
            if (resp.statusCode === 201 || resp.statusCode === 200) {
                renderData(null, resp.statusCode);
            } else {
                console.log("body ", body)
                var error = {
                    status: resp.statusCode,
                    message: body,
                };
                renderData(error);
            }
        }
    });
  },
  createDeal: function (args) {
    request(reqData.createDeal(args), function (err, resp, body) {
        if (err) {
            console.log("err ", err)
        renderData(err);
        }
        console.log(resp.statusCode)
      if (resp.statusCode === 201 || resp.statusCode === 200) {
          var dealID = body.data.id;
          console.log(dealID)
        var finalObj = {
          finalStatus: resp.statusCode,
          dealID: dealID,
        };
        renderData(null, finalObj);
      } else {
        var error = {
          status: resp.statusCode,
          message: body,
        };
        renderData(error);
      }
    });
  },
  addProducts: function (args) {
    request(reqData.addProducts(args), function (err, resp, body) {
      if (err) {
        renderData(err);
      }
      if (resp.statusCode === 201 || resp.statusCode === 200) {
        renderData();
      } else {
        var error = {
          status: resp.statusCode,
          message: body,
        };
        renderData(error);
      }
    });
  },
  fetchPipeline: function (args) {
    request(reqData.fetchPipeline(args), function (err, resp, body) {
      if (err) {
        renderData(err);
      }
      if (resp.statusCode == 201 || resp.statusCode == 200) {
        var respObj = JSON.parse(body).data;
        var dealPipeline = [];
        if (respObj != null) {
          for (var i = 0; i < respObj.length; i++) {
            var obj = {
              id: respObj[i].id,
              name: respObj[i].name,
              url_title: respObj[i].url_title,
            };
            dealPipeline.push(obj);
          }
        }
        renderData(null, dealPipeline);
      } else {
        var error = {
          status: resp.statusCode,
          message: body,
        };
        renderData(error);
      }
    });
  },
  fetchPipelineStage: function (args) {
    request(reqData.fetchPipelineStage(args), function (err, resp, body) {
      if (err) {
        renderData(err);
      }
      if (resp.statusCode == 201 || resp.statusCode == 200) {
        var respObj = JSON.parse(body).data;
        var dealPipelineStage = [];
        if (respObj != null) {
          for (var i = 0; i < respObj.length; i++) {
            var obj = {
              id: respObj[i].id,
              name: respObj[i].name,
            };
            dealPipelineStage.push(obj);
          }
        }
        renderData(null, dealPipelineStage);
      } else {
        var error = {
          status: resp.statusCode,
          message: body,
        };
        renderData(error);
      }
    });
  },
  fetchOwner: function (args) {
    request(reqData.fetchOwner(args), function (err, resp, body) {
      if (err) {
        renderData(err);
      }
      if (resp.statusCode === 201 || resp.statusCode === 200) {
        var respObj = JSON.parse(body).data;
        renderData(null, respObj);
      } else {
        var error = {
          status: resp.statusCode,
          message: body,
        };
        renderData(error);
      }
    });
  },
  addNote: function (args) {
    request(
      reqData.addNote(args),
      function (err, resp, body) {
        if (err) {
          renderData(err);
        }
        if (resp.statusCode === 201 || resp.statusCode === 200) {
          var respObj = body.data;
          renderData(null, respObj);
        } else {
          var error = {
            status: resp.statusCode,
            message: body,
          };
          renderData(error);
        }
      },
      function (error) {
        renderData(error);
      }
    );
  },
};
function updateDealStatusInPipedrive(args) {
  let dealID = args.dealID;
  let dealStatus = args.dealStatus;
  let baseUrl = "https://api.pipedrive.com/v1/";
  let apiKey = args.iparams.pAPI;
  let url = `${baseUrl}deals/${dealID}?api_token=${apiKey}`;
  let headers = {
    "Content-Type": "application/json",
  };
  let body = {
    status: dealStatus,
  };
  let options = {
    headers: headers,
    body: JSON.stringify(body),
  };
  $request.put(url, options).then(
    function () {
      try {
        if (dealStatus === "won") {
          renderData(null, "success");
        } else {
          renderData(null, "success when deal is LOST");
        }
      } catch (error) {
        renderData(error);
      }
    },
    function (error) {
      renderData(error);
    }
  );
}
function getListOfCurrency(args) {
  var baseUrl = "https://api.pipedrive.com/v1/";
  var apiKey = args.iparams.pAPI;
  var url = `${baseUrl}currencies?api_token=${apiKey}`;
  var headers = {
    Accept: "application/json",
  };
  var options = {
    headers: headers,
  };
  $request.get(url, options).then(
    function (data) {
      try {
        let currencyData = JSON.parse(data.response).data;
        renderData(null, currencyData);
      } catch (error) {
        renderData(error);
      }
    },
    function (error) {
      renderData(error);
    }
  );
}
function getTheList(args) {
  var baseUrl = "https://api.pipedrive.com/v1/";
  var apiKey = args.iparams.pAPI;
  var comboName = args.comboname;
  console.log("comboName -- >> ", comboName);
  var url = `${baseUrl}products/search?term=${comboName}&api_token=${apiKey}`;
  var headers = {
    Accept: "application/json",
  };
  var options = {
    headers: headers,
  };
  $request.get(url, options).then(
    function (data) {
      try {
        var filterList = JSON.parse(data.response).data.items;
        var itemsArr = [];
        for (let i = 0; i < filterList.length; i++) {
          let customFields = filterList[i].item.custom_fields;
          for (let j = 0; j < customFields.length; j++) {
            if (customFields[j].includes(`${comboName}`)) {
              if (customFields[j].includes(",")) {
                let checkMultipleCombos = customFields[j].split(",");
                for (let k = 0; k < checkMultipleCombos.length; k++) {
                  if (checkMultipleCombos[k].trim() === comboName.trim()) {
                    itemsArr.push(filterList[i].item.id);
                    break;
                  }
                }
              } else {
                if (customFields[j] === comboName) {
                  itemsArr.push(filterList[i].item.id);
                  break;
                }
              }
            }
          }
        }
        if (itemsArr.length < 100) {
          renderData(null, itemsArr);
        }
      } catch (error) {
        renderData(error);
      }
    },
    function (error) {
      renderData(error);
    }
  );
}
function getProductDetails(args) {
  var baseUrl = "https://api.pipedrive.com/v1/";
  var apiKey = args.iparams.pAPI;
  var finalProductID = args.specificProductID;
  var requiredCurrency = args.productCurrency;
  var url = `${baseUrl}products/${finalProductID}?api_token=${apiKey}`;
  var headers = {
    Accept: "application/json",
  };
  var options = {
    headers: headers,
  };
  $request.get(url, options).then(
    function (data) {
      try {
        var productPriceArr = JSON.parse(data.response).data.prices;
        var productPrice;
        let getActiveProduct = JSON.parse(data.response).data.selectable;
        console.log("productPriceArr.length --- >>> ", productPriceArr.length);
        if (getActiveProduct === true && productPriceArr.length !== 0) {
          for (let i = 0; i < productPriceArr.length; i++) {
            if (productPriceArr[i].currency === requiredCurrency) {
              productPrice = productPriceArr[i].price;
              renderData(null, productPrice);
            }
          }
        } else {
          productPrice = 0;
          renderData(null, productPrice);
        }
      } catch (error) {
        renderData(error);
      }
    },
    function (error) {
      renderData(error);
    }
  );
}
function getCompanyFieldValue(args) {
  console.log("in getCompanyFieldValue function");
  let companyId = args.companyID;
  console.log("companyId ", companyId);
  let url = `https://${args["iparams"]["fdUrl"]}/api/v2/companies/${companyId}`;
  let header = {
    Authorization: "Basic " + base64.encode(args.iparams.fdAPI),
    "Content-Type": "application/json",
  };
  let options = {
    headers: header,
  };
  $request.get(url, options).then(
    function (data) {
      var res1 = JSON.parse(data.response);
      let companyCustomFields = res1.custom_fields;
      let arr = [];
      let mdmVal;
      let mappedOrganizationFields = args.iparams.selectedFields;
      for (mappedField of mappedOrganizationFields) {
        let obj = {};
        let freshdeskOrgField = mappedField.FDCompanyFieldVal;
        let pipedriveOrganizationField = mappedField.pipeFieldVal;
        let reqVal = res1[freshdeskOrgField];
        if (reqVal != "" && reqVal != null && reqVal != undefined) {
          obj[`${pipedriveOrganizationField}`] = reqVal;
          arr.push(obj);
        } else {
          let pipedriveFieldName = mappedField.pipeField;
          let reqVal = companyCustomFields[freshdeskOrgField];
          if (
            pipedriveFieldName.includes("MDM") ||
            pipedriveFieldName.includes("mdm")
          ) {
            mdmVal = reqVal;
          }
          if (reqVal != "" && reqVal != null && reqVal != undefined) {
            obj[`${pipedriveOrganizationField}`] = reqVal;
            arr.push(obj);
          }
        }
      }
      let address = "",
        name = "",
        requiredObjectTocreateOrganization = {};
      for (let i = 0; i < arr.length; i++) {
        if (arr[i]["name"] != undefined && arr[i]["name"] != null) {
          name += `${arr[i]["name"]}`;
        } else if (
          arr[i]["address"] != undefined &&
          arr[i]["address"] != null
        ) {
          address += `${arr[i]["address"]}, `;
        } else {
          requiredObjectTocreateOrganization[Object.entries(arr[i])[0][0]] =
            Object.entries(arr[i])[0][1];
        }
      }
      requiredObjectTocreateOrganization["name"] = name;
      requiredObjectTocreateOrganization["address"] = address;
      let orgBody = JSON.stringify(requiredObjectTocreateOrganization);
      checkIfProtegeOrgPresent(args, orgBody, mdmVal);
    },
    function (error) {
      console.log("error during fetching the company details");
      renderData(error);
    }
  );
}
function checkIfProtegeOrgPresent(args, orgBody, mdmVal) {
  var baseUrl = "https://api.pipedrive.com/v1/";
  var apiKey = args.iparams.pAPI;
  let companyId = args.companyID;
  var url = `${baseUrl}organizations/search?term=${companyId}&fields=custom_fields&api_token=${apiKey}`;
  var headers = {
    Accept: "application/json",
  };
  var options = {
    headers: headers,
  };
  $request.get(url, options).then(
    function (data) {
      try {
        var result1 = JSON.parse(data.response).data.items;
        var organisationID;
        if (result1.length !== 0) {
          organisationID = result1[0].item.id;
          renderData(null, organisationID);
        } else {
          checkOrganisationPresent(args, orgBody, mdmVal);
        }
      } catch (error) {
        renderData(error);
      }
    },
    function (error) {
      renderData(error);
    }
  );
}
// checking if the organization field contains the company id or not
function checkOrganisationPresent(args, orgBody, mdmVal) {
  var baseUrl = "https://api.pipedrive.com/v1/";
  var apiKey = args.iparams.pAPI;
  var url = `${baseUrl}organizations/search?term=${mdmVal}&fields=custom_fields&api_token=${apiKey}`;
  var headers = {
    Accept: "application/json",
  };
  var options = {
    headers: headers,
  };
  $request.get(url, options).then(
    function (data) {
      try {
        var result = JSON.parse(data.response).data.items;
        var organisationID;
        if (result.length > 0) {
          organisationID = result[0].item.id;
          let company_id = args.companyID;
          updateOrganization(args, organisationID, company_id);
        } else {
          createOrgInPipedrive(args, orgBody);
        }
      } catch (error) {
        renderData(error);
      }
    },
    function (error) {
      renderData(error);
    }
  );
}
// create a new organization in pipedrive
function createOrgInPipedrive(args, orgBody) {
  let company_id = args.companyID;
  var baseUrl = "https://api.pipedrive.com/v1/";
  var apiKey = args.iparams.pAPI;
  var url = `${baseUrl}organizations?api_token=${apiKey}`;
  var headers = {
    "Content-Type": "application/json",
  };
  var options = {
    headers: headers,
    body: orgBody,
  };
  $request.post(url, options).then(
    function (data) {
      try {
        console.log("An organization is created successfully in Pipedrive !!!");
        var res = JSON.parse(data.response);
        var organisationID = res.data.id;
        updateOrganization(args, organisationID, company_id);
      } catch (error) {
        renderData(error);
      }
    },
    function (error) {
      renderData(error);
    }
  );
}
// update the created organization
function updateOrganization(args, organisationID, company_id) {
  console.log("in updateOrganization function");
  var orgField = args.iparams.orgProtegeID;
  let company_name = base64.decode(args.companyName);
  var baseUrl = "https://api.pipedrive.com/v1/";
  var apiKey = args.iparams.pAPI;
  var url = `${baseUrl}organizations/${organisationID}?api_token=${apiKey}`;
  var headers = {
    "Content-Type": "application/json",
  };
  var body = {};
  body[`${orgField}`] = company_id;
  var options = {
    headers: headers,
    body: JSON.stringify(body),
  };
  $request.put(url, options).then(
    function () {
      try {
        console.log(
          `Updated the ${company_name} company ID in pipedrive organisation.`
        );
        renderData(null, organisationID);
      } catch (error) {
        renderData(error);
      }
    },
    function () {
      renderData(null, organisationID);
    }
  );
}
