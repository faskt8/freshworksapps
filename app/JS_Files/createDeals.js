$(document).ready(function() {
    app.initialized().then(function(_client) {
        var createDealsClient = _client;
        $("#loadSpinner, #createDealNotify, #createDealNotify1, #page1, #page2, #organisationNameError, #listOfProductsError, #selectCurrencyError").hide();
        $("#loadingMSGDuringDealCreate").show().html('Loading Please Wait...');
        $("#titleCreate, #valueCreate, #organisationName, #organisationID").click(function() {
            $("#titleError, #valueError").hide();
        });
        $("#listOfProducts, #selectCurrency").change(function() {
            $("#listOfProductsError, #selectCurrencyError, #createDealNotify1, #createDealNotify").hide();
            enableAddProductButton();
        });
        $("#closeButton").click(function() {
            $("#closeButton").text("closing...");
            $("#closeButton").prop("disabled", true);
            createDealsClient.db.get("DealID").then(function(DBData) {
                closeOpenModel(createDealsClient, DBData.requesterEmailID);
            }, function() {
                handleError(client, "warning", "The error occured during retriving data from 'DealID' DB.");
                enableAddProductButton();
            });
        });
        $("#addProduct").click(function() {
            $("#closeButton").prop("disabled", true);
            var productID = $("#listOfProducts").val();
            var selectedCurrency = $("#selectCurrency").val();
            if (productID === "Select" || selectedCurrency === "Select") {
                if (productID === "Select") {
                    $("#listOfProductsError").show().html("This field is Mandatory.");
                }
                if (productID === "Select") {
                    $("#selectCurrencyError").show().html("This field is Mandatory.");
                }
                $("#addProduct").text("Add Product").prop("disabled", false);
                $("#closeButton").prop("disabled", false);
            } else {
                $("#addProduct").text("Adding...").prop("disabled", true);
                createDealsClient.db.get("DealID").then(function(DBData) {
                    addProducts(createDealsClient, DBData.dealID);
                }, function() {
                    handleError(client, "warning", "The error occured during retriving data from 'DealID' DB.");
                    enableAddProductButton();
                });
            }
        });
        createDealsClient.instance.context().then(function(data) {
            var organisationName = data.data.orgName;
            var organizationProtageID = data.data.organizationprotageID;
            if ((organisationName !== undefined && organisationName !== null && organisationName !== " " && organisationName !== "No Organisation") && (organizationProtageID !== undefined && organizationProtageID !== null && organizationProtageID !== " " && organizationProtageID !== "No Organisation")) {
                reduceComplexity(organisationName, organizationProtageID, createDealsClient);
            } else if (organizationProtageID === undefined) {
                reduceComplexity(organisationName, organizationProtageID, createDealsClient);
            } else {
                reduceComplexityError();
            }
            // pipelines(createDealsClient);
        }, function() {
            $("#createDealNotify").show().html('Unexpected error occurred, please try after sometime.');
        });
        $(document).on('change', '#dealPipeline', function(event) {
            $("#dealStage").val('Select').trigger('change');
            var id = event.target.value;
            createDealsClient.db.get("defaultPipeline").then(function(DBData) {
                var count = DBData.count;
                if (id !== "Select") {
                    pipelineStages(createDealsClient, id, count);
                }
            }, function(error) {
                if (error.status === 404) {
                    pipelineStages(createDealsClient, id, 0);
                }
            });
        });
        // create deal button
        $("#createDealButton").click(function() {
            $("#createDealNotify1, #createDealNotify1").hide();
            $("#createDealButton").text('Creating...');
            $("#createDealButton").prop('disabled', true);
            var titleValue = $("#titleCreate").val();
            var valueValue = $("#valueCreate").val();
            var numberPattern = /[0-9]$/;
            // to check if the value is present in both input blocks
            if (titleValue === '' || valueValue === '') {
                if (titleValue === '') {
                    $("#titleError").show().html('This field is required.');
                }
                if (valueValue === '') {
                    $("#valueError").show().html('This field is required.');
                }
                $("#createDealButton").text('Create');
                $("#createDealButton").prop('disabled', false);
            } else {
                if (numberPattern.test(valueValue) === false) {
                    enableCreateDealButton();
                    $("#valueError").html("Enter the valid value.");
                } else {
                    getpersonID(createDealsClient, titleValue, valueValue);
                }
            }
        });
        $("#titleCreate, #valueCreate").click(function() {
            $("#titleError, #valueError, #createDealNotify").html('');
            $("#createDealButton").text('Create');
            $("#createDealButton").prop('disabled', false);
        });
    }, function() {
        $("#createDealNotify").show().html('Unexpected error occurred, please try after sometime.');
        closeModal(createDealsClient);
    });

    function reduceComplexity(organisationName, organizationProtageID, createDealsClient) {
        if (organisationName !== undefined && organisationName !== null && organisationName !== " " && organisationName !== "No Organisation") {
            $("#organisationName").val(organisationName);
        }
        if (organizationProtageID !== undefined && organizationProtageID !== null && organizationProtageID !== " " && organizationProtageID !== "No Organisation") {
            $("#organisationID").val(organizationProtageID);
        }
        pipelines(createDealsClient);
    }

    function reduceComplexityError() {
        $("#organisationNameError").show().html("There is no organisation present for this person.");
        $("#organisationIDError").show().html("There is no organisation present for this person.");
        $("#organisationID").prop("disabled", true);
        $("#organisationName").prop("disabled", true);
    }

    function pipelines(createDealsClient) {
        let options = {};
        createDealsClient.request.invoke('fetchPipeline', options).then(function(data) {
            var result = data.response;
            var str = "";
            str += "<option>Select</option>";
            var defaultVal;
            if (result !== null) {
                $.each(result, function(key, value) {
                    if (value.url_title === "default") {
                        defaultVal = value.id;
                    }
                    str += "<option value=" + value.id + ">" + value.name + "</option>";
                })
                $("#dealPipeline").html(str);
                createDealsClient.db.set("defaultPipeline", {
                    "defaultVal": "FirstTime",
                    "count": 0
                }).then(function() {
                    // console.log('DB is set');
                }, function() {
                    $("#createDealNotify").show().html("The error occured during creation of 'defaultPipeline' DB.");
                });
                $("#dealPipeline").val(defaultVal).trigger('change');
                $("#dealStage").prop('disabled', true);
                owners(createDealsClient);
            }
        }, function() {
            $("#loadingMSGDuringDealCreate").html('Unexpected error occured, please try after some time.').addClass('text-danger').fadeOut(5000);
        });
    }

    function pipelineStages(createDealsClient, id, count) {
        let options = {
            "id": btoa(id)
        };
        createDealsClient.request.invoke('fetchPipelineStage', options).then(function(data) {
            $("#loadingMSGDuringDealCreate").html('');
            $("#page1").show();
            var result = data.response;
            var str1 = "";
            str1 += "<option>Select</option>";
            var defaultStage;
            if (result !== null) {
                $.each(result, function(key, value) {
                    if (id !== "Select") {
                        defaultStage = 1;
                    }
                    str1 += "<option value=" + value.id + ">" + value.name + "</option>";
                })
                $("#dealStage").prop('disabled', false);
                $("#dealStage").html(str1);
                if (defaultStage === 1 && count === 0) {
                    let newCount = count + 1;
                    createDealsClient.db.set("defaultPipeline", {
                        "defaultVal": "FirstTime",
                        "count": newCount
                    }).then(function() {
                        // console.log('DB is set');
                    }, function() {
                        $("#createDealNotify").show().html("The error occured during creation of 'defaultPipeline' DB.");
                    });
                    $("#dealStage").val(defaultStage).trigger('change');
                } else {
                    $("#dealStage").val("Select").trigger('change');
                }
            } else {
                $("#dealStageError").html('No stages present for this Pipeline.').addClass('text-danger').fadeOut(5000);
            }
        }, function() {
            $("#dealStageError").html('Unable to fetch the stage Ids, please try again.').addClass('text-danger').fadeOut(5000);
        });
    }

    function owners(createDealsClient) {
        var options = {};
        createDealsClient.request.invoke('fetchOwner', options).then(function(data) {
            var str2 = "";
            var result1 = data.response;
            str2 += "<option>Select</option>";
            if (result1 !== null) {
                $.each(result1, function(key, value) {
                    if (value.active_flag)
                        str2 += "<option value=" + value.id + ">" + value.name + "</option>";
                })
                $("#dealOwner").html(str2);
                getAllProducts(createDealsClient);
            }
        }, function() {
            $("#dealOwnerError").html('Unexpected error occured to fetch owners, please try again.').addClass('text-danger').fadeOut(5000);
        })
    }

    function getAllProducts(createDealsClient) {
        createDealsClient.iparams.get().then(function(data) {
            var result2 = data.comboNames;
            var res1 = result2.split(",");
            var str3 = "<option>Select</option>";
            for (let i = 0; i < res1.length; i++) {
                str3 += "<option>" + res1[i] + "</option>";
            }
            $("#listOfProducts").html(str3);
            // $("#loadingMSGDuringDealCreate").html('');
            // $("#page1").show();
        }, function() {
            enableAddProductButton();
            $("#dealOwnerError").html('Unexpected error occured to fetch owners, please try again.').addClass('text-danger').fadeOut(5000);
        })
    }
    // instance.context function
    function getpersonID(createDealsClient, titleValue, valueValue) {
        createDealsClient.instance.context().then(function(data) {
            var personID = data.data.id;
            var requesterEmailID = data.data.emailID;
            var companyID = data.data.organizationprotageID;
            var companyName = data.data.orgName;
            var dealPipeline = $("#dealPipeline").val();
            var ownerIDAsUserID = $("#dealOwner").val();
            var dealStageID = $("#dealStage").val();
            if (companyID !== undefined && companyID !== null && companyID !== "No Organisation") {
                var requiredObj = {
                    "title": btoa(titleValue),
                    "value": btoa(valueValue),
                    "personID": btoa(personID),
                    "companyID": (companyID),
                    "companyName": btoa(companyName),
                    "dealPipeline": dealPipeline,
                    "ownerIDAsUserID": ownerIDAsUserID,
                    "dealStageID": dealStageID
                };
                createOrgInPipe(createDealsClient, requesterEmailID, requiredObj);
            } else {
                var requiredObj = {
                    "title": btoa(titleValue),
                    "value": btoa(valueValue),
                    "personID": btoa(personID),
                    "dealPipeline": dealPipeline,
                    "ownerIDAsUserID": ownerIDAsUserID,
                    "dealStageID": dealStageID
                };
                createDeal(createDealsClient, requesterEmailID, requiredObj);
            }

        }, function() {
            $("#createDealNotify").show().html('Unexpected error occurred, please try after sometime.');
            closeModal(createDealsClient);
        });
    }

    function createOrgInPipe(createDealsClient, requesterEmailID, requiredObj) {
        createDealsClient.request.invoke('checkOrganisation', requiredObj).then(function(data) {
            let pipeOrgID = data.response;
            requiredObj["organisationID"] = pipeOrgID;
            createDeal(createDealsClient, requesterEmailID, requiredObj);
        }, function() {
            $("#createDealNotify").show().html('Failed to Create Deal, please try again.');
            enableCreateDealButton();
        });
    }
    // function to create a new deal
    function createDeal(createDealsClient, requesterEmailID, requiredObj) {
        // to get the person's id and required values from iparam's page
        var options = requiredObj;
        createDealsClient.request.invoke('createDeal', options).then(function(data) {
            if (data.response.finalStatus === 200 || data.response.finalStatus === 201) {
                var dealID = data.response.dealID;
                createDealsClient.db.set("DealID", {
                    "dealID": dealID,
                    "requesterEmailID": requesterEmailID
                }).then(function() {
                    getTicketIDToAddNote(createDealsClient, dealID);
                }, function() {
                    $("#createDealNotify").show().html("The error occured during creation of 'DealID' DB.");
                });

            }
        }, function (error) {
            console.log(error)
            $("#createDealNotify").show().html('Failed to Create Deal, please try again.');
            enableCreateDealButton();
        });
    }
    // function to get all the products
    function addProducts(createDealsClient, dealID) {
        var comboName = $("#listOfProducts").val();
        var productCurrency = $("#selectCurrency").val();
        let options = {
            "comboname": comboName
        }
        createDealsClient.request.invoke('getAllProductsUsingfFilter', options).then(function(data) {
            let listOfProductID = data.response;
            console.log('listOfProductID', listOfProductID);
            if (listOfProductID.length === 0) {
                $("#createDealNotify1").show().html("The combo does not contain any products.");
                $("#listOfProducts").val("Select");
                enableAddProductButton();
            } else {
                var count = 0;
                getProductDetails(createDealsClient, dealID, listOfProductID, count, productCurrency);
            }
        }, function() {
            $("#createDealNotify").show().html('Failed to add product, please try again.');
            enableAddProductButton();
        });
    }
    // function to get product details
    function getProductDetails(createDealsClient, dealID, productID, count, productCurrency) {
        if (productID[count] !== undefined) {
            let options = {
                "specificProductID": productID[count],
                "productCurrency": productCurrency
            };
            createDealsClient.request.invoke('productDetails', options).then(function(data) {
                let productPrice = data.response;
                if (productPrice !== null) {
                    addMultipleProducts(createDealsClient, dealID, productID, count, productPrice, productCurrency);
                } else {
                    let newCount = count + 1;
                    getProductDetails(createDealsClient, dealID, productID, newCount, productCurrency);
                }
            }, function() {
                $("#createDealNotify").show().html('Failed to add product, please try again.');
                enableAddProductButton();
            });
        } else {
            $("#closeButton").prop("disabled", false);
            $("#createDealNotify1").show().html("A Product is added successfully. ");
            $("#addProduct").text("Add Product").prop("disabled", false);
            $("#listOfProducts").val("Select");
        }
    }
    // function to add multiple products
    function addMultipleProducts(createDealsClient, dealID, productID, count, productPrice, productCurrency) {
        var numberOfProducts = 1;
        var newProductID = productID[count];
        var productObj = {
            "productID": newProductID,
            "productPrice": productPrice,
            "numberOfProducts": numberOfProducts,
            "dealID": dealID
        };
        var options = productObj;
        createDealsClient.request.invoke('addProducts', options).then(function() {
            let newCount = count + 1;
            if (newCount === newCount * 15) {
                setTimeout(function() {
                    getProductDetails(createDealsClient, dealID, productID, newCount, productCurrency);
                }, 5000);
            } else {
                getProductDetails(createDealsClient, dealID, productID, newCount, productCurrency);
            }
        }, function(error) {
            if (error.status === 504) {
                addMultipleProducts(createDealsClient, dealID, productID, count, productPrice, productCurrency);
            } else {
                $("#createDealNotify").show().html('Failed to Add Product, please try again.');
                enableAddProductButton();
            }
        });
    }

    function getTicketIDToAddNote(createDealsClient, dealID) {
        createDealsClient.data.get("ticket").then(function(data) {
                var ticketID = data.ticket.id;
                addANote(createDealsClient, ticketID, dealID);
            },
            function (error) {
                console.log("Error in getting ticket details ", error)
                // $("#createDealNotify").show().html('Failed to Create Deal, please try again.');
                // enableCreateDealButton();
                $("#createDealNotify1").show().html('O negócio foi criado com sucesso!!!');
                closeModal(createDealsClient);
            }
        );
    }

    function addANote(createDealsClient, ticketID, dealID) {
        var options = {
            "ticketID": ticketID,
            "dealID": dealID
        };
        createDealsClient.request.invoke('addNote', options).then(function() {
            getListOfCurrencies(createDealsClient);
        }, function (error) {
            console.log("Error in adding a note ", error)
            //$("#createDealNotify").show().html('Failed to Create Deal, please try again.');
            //enableCreateDealButton();
            $("#createDealNotify1").show().html('O negócio foi criado com sucesso!!!');
            closeModal(createDealsClient);
        });
    }

    function enableCreateDealButton() {
        $("#createDealButton").text('Create');
        $("#createDealButton").prop('disabled', false);
    }

    function enableAddProductButton() {
        $("#closeButton, #addProduct").prop("disabled", false);
        $("#addProduct").text("Add Product");
    }


    function getListOfCurrencies(createDealsClient) {
        let options = {}
        createDealsClient.request.invoke('getAllCurrencies', options).then(function(data) {
            var allCurrencies = data.response;
            var str4 = `<option>Select</option>`;
            for (let i = 0; i < allCurrencies.length; i++) {
                str4 += `<option value=${allCurrencies[i].code}>${allCurrencies[i].name} (${allCurrencies[i].code})</option>`;
            }
            $("#selectCurrency").html(str4);
            $("#selectCurrency").val("BRL");
            $("#closeButton").prop("disabled", false);
            $("#page1").hide();
            $("#page2").show();
            // $("#createDealNotify1").show().html('A Deal is Created Successfully!!');
            $("#createDealNotify1").show().html('O negócio foi criado com sucesso!!!');
        }, function() {
            $("#selectCurrencyError").show().html("Unable to retrive the list of currencies.");
        });
    }

    function closeOpenModel(createDealsClient, requesterEmailID) {
        // $("#closeButton").text("closed");
        $("#closeButton").text("Fechado");
        createDealsClient.instance.send({
            message: {
                email: requesterEmailID
            }
        });
        closeModal(createDealsClient);
    }
});