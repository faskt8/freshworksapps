$(document).ready(function () {
	app.initialized().then(
		function (_client) {
			var client = _client;
			client.events.on(
				"app.activated",
				function () {
					$("#loadingMSG").show().html("Loading Please Wait...");
					$(
						"#orgDiv, #conLabel, #dealLabel, #createContact, #contactError,#activityLabel"
					).hide();
					widgetResize(client);
					getRequesterEmail(client);
				},
				function () {
					handleError(
						client,
						"warning",
						"Unexpected error occurred, please try after sometime."
					);
				}
			);
			instanceModel(client);
			$("#org_detail").click(function (event) {
				var id = event.target.id;
				// client.interface.trigger("showModal", {
				//     title: "Organisation Details",
				//     template: "organisation.html",
				//     data: {
				//         "id": id
				//     }
				// });
				client.interface.trigger("showModal", {
					title: "Detalhes da organização",
					template: "organisation.html",
					data: {
						id: id,
					},
				});
			});
			$(document).on("click", ".createdeal", function (event) {
				openModelToCreateDeal(client, event);
			});
			$("#createContact").click(function () {
				contactDetailsFromFreshdesk(client);
			});
			$(document).on("click", ".opendeal", function (event) {
				var pid = event.target.id;
				// client.interface.trigger("showModal", {
				//     title: "All Open Deals",
				//     template: "deals.html",
				//     data: {
				//         "id": pid
				//     }
				// });
				client.interface.trigger("showModal", {
					title: "Todos os negócios abertos",
					template: "deals.html",
					data: {
						id: pid,
					},
				});
			});
		},
		function () {
			handleError(
				client,
				"warning",
				"Unexpected error occurred, please try again."
			);
		}
	);
	//get iparamData
	var iparamData = function (client, callback) {
		client.iparams.get().then(
			function (data) {
				var pipeURL = data.pURL;
				var contactArrayKV = data.contactsArrayObj;
				var res = [pipeURL, contactArrayKV];
				callback(res);
			},
			function () {
				handleError(
					client,
					"danger",
					"Unexpected error occurred, please try after sometime."
				);
			}
		);
	};
	var getContactDetails = function (client, callback) {
		var reqData = {};
		client.data.get("contact").then(
			function (data) {
				console.log("contact data ", data);
				// var requesterName =
				//   data.contact.name !== null ? data.contact.name : "NA";
				// var requesterMobile = data.contact.mobile;
				// var requesterEmail =
				//   data.contact.email !== null ? data.contact.email : "NA";
				var companyID =
					data.contact.company_id !== null ? data.contact.company_id : "NA";
				// reqData["requesterName"] = requesterName;
				// reqData["requesterMobile"] = requesterMobile;
				// reqData["requesterEmail"] = requesterEmail;
				reqData["contactData"] = data;
				if (companyID !== "NA") {
					client.data.get("company").then(
						function (data) {
							//   var companyName = data.company.name;
							//   reqData["companyName"] = companyName;
							//   reqData["companyID"] = companyID;
							reqData["companyData"] = data;
							callback(reqData);
						},
						function () {
							handleError(
								client,
								"danger",
								"Unexpected error occurred, please try after sometime."
							);
						}
					);
				} else {
					reqData["companyName"] = "NA";
					callback(reqData);
				}
			},
			function () {
				handleError(
					client,
					"danger",
					"Unexpected error occurred, please try after sometime."
				);
			}
		);
	};

	function openModelToCreateDeal(client, event) {
		let pid = event.target.id;
		let email = event.target.dataset.email;
		var orgID = event.target.dataset.organisationid;
		var orgName = event.target.dataset.organisationname;
		var organizationprotageid = event.target.dataset.organizationprotageid;
		if (
			orgID !== "No Organisation" &&
			orgName !== "No Organisation" &&
			organizationprotageid !== "No Organisation"
		) {
			var obj = {
				id: pid,
				emailID: email,
				orgID: orgID,
				orgName: orgName,
				organizationprotageID: organizationprotageid,
			};
			// client.interface.trigger("showModal", {
			//     title: "Create a Deal",
			//     template: "createDeals.html",
			//     data: obj
			// });
			client.interface.trigger("showModal", {
				title: "Criar Negócio",
				template: "createDeals.html",
				data: obj,
			});
		} else {
			getContactDetails(
				client,
				function (data) {
					var orgName = data.companyName;
					var organizationprotageid = data.companyID;
					if (orgName === "NA") {
						var obj = {
							id: pid,
							emailID: email,
						};
					} else {
						var obj = {
							id: pid,
							emailID: email,
							orgName: orgName,
							organizationprotageID: organizationprotageid,
						};
					}
					// client.interface.trigger("showModal", {
					//     title: "Create a Deal",
					//     template: "createDeals.html",
					//     data: obj
					// });
					client.interface.trigger("showModal", {
						title: "Criar Negócio",
						template: "createDeals.html",
						data: obj,
					});
				},
				function () {
					handleError(
						client,
						"danger",
						"Unexpected error occurred, please try after sometime."
					);
				}
			);
		}
	}
	// checking the contact details once clicked on create contact link to create a new comtact in pipedrive
	function contactDetailsFromFreshdesk(client) {
		getContactDetails(
			client,
			function (contactData) {
				createContactInPipedrive(client, contactData);
			},
			function () {
				handleError(
					client,
					"danger",
					"Unexpected error occurred, please try after sometime."
				);
			}
		);
	}

	function createContactInPipedrive(client, reqData) {
		client.interface.trigger("showModal", {
			title: "Create a New Contact",
			template: "createContact.html",
			data: reqData,
		});
	}
	//  to get requester's email id
	function getRequesterEmail(client) {
		console.log("in get requester details");
		iparamData(client, function (idata) {
			var contactArrayKV = idata[1];
			var requiredURL = idata[0];
			client.data.get("contact").then(
				function (data) {
					var requesterEmail = data.contact.email;
					var companyID = data.contact.company_id;
					console.log("companyID == ", companyID);
					if (companyID !== null) {
						getPersonID(
							client,
							contactArrayKV,
							requesterEmail,
							requiredURL,
							companyID
						);
					} else {
						companyID = "companyID";
						getPersonID(
							client,
							contactArrayKV,
							requesterEmail,
							requiredURL,
							companyID
						);
					}
				},
				function (e) {
					console.log(e);
					handleError(
						client,
						"danger",
						"Unexpected error occurred, please try after sometime."
					);
				}
			);
		});
	}
	// to get the id of a person(here person in the sense contact)
	function getPersonID(
		client,
		contactArrayKV,
		requesterEmail,
		requiredURL,
		companyID
	) {
		console.log("in getPersonID function");
		var url = `https://<%= iparam.pURL%>/v1/persons/search?term='${requesterEmail}'&api_token=<%= iparam.pAPI%>`;
		console.log(url);
		var headers = {
			Accept: "application/json",
		};
		var options = {
			headers: headers,
		};
		client.request.get(url, options).then(
			function (data) {
				try {
					console.log("JSON.parse(data.response) ", JSON.parse(data.response));
					if (JSON.parse(data.response).data.items.length > 0) {
						var personID = JSON.parse(data.response).data.items[0].item.id;
						console.log("personID ", personID);
						getPersonDetails(
							client,
							contactArrayKV,
							personID,
							requesterEmail,
							requiredURL,
							companyID
						);
					} else {
						$("#loadingMSG").hide();
						// $("#contactError").show().html('The Requester is not present in Pipedrive.');
						$("#contactError")
							.show()
							.html("O solicitante não está presente no Pipedrive.");
						$("#creatingContact ,#createContact").show();
						widgetResize(client);
					}
				} catch (error) {
					handleError(
						client,
						"danger",
						"Unexpected error occurred, please try after sometime."
					);
				}
			},
			function (error) {
				console.log("error in getperson ID ", error);
				handleError(
					client,
					"danger",
					"Unexpected error occurred, please try after sometime."
				);
			}
		);
	}
	// to get complete details of a person
	function getPersonDetails(
		client,
		contactArrayKV,
		personID,
		requesterEmail,
		requiredURL,
		companyID
	) {
		console.log("in getPersonDetails function");
		var url = `https://<%= iparam.pURL%>/v1/persons/${personID}?api_token=<%= iparam.pAPI%>`;
		var headers = {
			Accept: "application/json",
		};
		var options = {
			headers: headers,
		};
		client.request.get(url, options).then(
			function (data) {
				try {
					var contactDetails = JSON.parse(data.response).data;
					dealLinkShow(contactDetails.open_deals_count, personID);
					showOrgDetail(contactDetails.org_id);
					showActivityDetail(client, personID);
					showPersonDetails(
						client,
						contactArrayKV,
						personID,
						requesterEmail,
						requiredURL,
						contactDetails,
						companyID
					);
				} catch (error) {
					handleError(
						client,
						"danger",
						"Unexpected error occurred, please try after sometime."
					);
				}
			},
			function () {
				handleError(
					client,
					"danger",
					"Unexpected error occurred, please try after sometime."
				);
			}
		);
	}

	function showPersonDetails(
		client,
		contactArrayKV,
		personID,
		requesterEmail,
		requiredURL,
		contactDetails,
		companyID
	) {
		console.log("in showPersonDetails function");
		var str = [];
		if (companyID !== "companyID") {
			var organizationProtageID = companyID;
		} else {
			var organizationProtageID = "No Organisation";
		}
		if (contactDetails.org_id !== null) {
			var orgID = contactDetails.org_id.value;
			var orgName = contactDetails.org_id.name;
		} else {
			var orgID = "No Organisation";
			var orgName = "No Organisation";
		}
		for (var i = 0; i < contactArrayKV.length; i++) {
			let key = contactArrayKV[i].key;
			let fieldName = contactArrayKV[i].value;
			let fieldValue =
				contactDetails[key] !== null ? contactDetails[key] : "N/A";
			if (
				key === "email" ||
				key === "phone" ||
				key === "org_id" ||
				key === "owner_id"
			) {
				showEmail(key, contactDetails, str);
				showPhone(key, contactDetails, str);
				showOrgId(key, contactDetails, str);
				showOwnerId(key, contactDetails, str);
			} else {
				str.push(
					`<div><label class="commonRequirementspan muted">${
						xssTest(fieldName)[0].innerHTML
					}</label><label class="appRequirementlabel">${
						xssTest(fieldValue)[0].innerHTML
					}</label></div>`
				);
			}
		}
		// $("#addDeals").show().html(`<a href="#" class="createdeal" id="${personID}"
		// data-email="${requesterEmail}"
		// data-organisationID="${orgID}"
		// data-organisationName="${orgName}"
		// data-organizationProtageID="${organizationProtageID}">Add Deals</a>`);
		$("#addDeals").show().html(`<a href="#" class="createdeal" id="${personID}" 
        data-email="${requesterEmail}" 
        data-organisationID="${orgID}" 
        data-organisationName="${orgName}"
        data-organizationProtageID="${organizationProtageID}">Adicionar Negócio</a>`);
		$(
			"#redirectCust"
		).html(`<a href="https://${requiredURL}/person/${personID}" rel="noreferrer" target="_blank"><i
        class="fa fa-external-link fr100"></i></a>`);
		$("#contact_detail").show().html(str.join(""));
		$("#conLabel, #dealLabel, .detailLabel, #creatingContact").show();
		$("#createContact, #loadingMSG").hide();
		widgetResize(client);
	}

	function showEmail(key, contactDetails, str) {
		if (key === "email") {
			let email =
				contactDetails[key][0].value !== ""
					? contactDetails[key][0].value
					: "N/A";
			str.push(
				`<div><label class="commonRequirementspan muted">Email  </label><label class="appRequirementlabel">${
					xssTest(email)[0].innerHTML
				}</label></div>`
			);
		}
	}

	function showPhone(key, contactDetails, str) {
		if (key === "phone") {
			let phone =
				contactDetails[key][0].value !== ""
					? contactDetails[key][0].value
					: "N/A";
			str.push(
				`<div><label class="commonRequirementspan muted">Phone Number  </label><label class="appRequirementlabel">${
					xssTest(phone)[0].innerHTML
				}</label></div>`
			);
		}
	}

	function showOrgId(key, contactDetails, str) {
		if (key === "org_id") {
			let nameOrg =
				contactDetails[key] !== null ? contactDetails[key].name : "N/A";
			str.push(
				`<div><label class="commonRequirementspan muted">Organisation Name  </label><label class="appRequirementlabel">${
					xssTest(nameOrg)[0].innerHTML
				}</label></div>`
			);
		}
	}

	function showOwnerId(key, contactDetails, str) {
		if (key === "owner_id") {
			let nameOwner =
				contactDetails[key] !== null ? contactDetails[key].name : "N/A";
			let emailOwner =
				contactDetails[key] !== null ? contactDetails[key].email : "N/A";
			str.push(`<div><label class="commonRequirementspan muted">Owner Name  </label><label class="appRequirementlabel">${
				xssTest(nameOwner)[0].innerHTML
			}</label></div>
                        <div><label class="commonRequirementspan muted">Owner Email  </label><label class="appRequirementlabel">${
													xssTest(emailOwner)[0].innerHTML
												}</label></div>`);
		}
	}

	function dealLinkShow(open_deals_count, personID) {
		console.log("in dealLinkShow function");
		if (open_deals_count > 0) {
			// $("#showDeals").show().html(`<a href="#" class="opendeal" id="${personID}">All Open Deals</a>`);
			$("#showDeals")
				.show()
				.html(
					`<a href="#" class="opendeal" id="${personID}">Todos os negócios abertos</a>`
				);
		}
	}

	function showOrgDetail(org_id) {
		console.log("in showOrgDetail function");
		if (org_id !== null) {
			$("#orgDiv").show();
			let orgName = org_id.name;
			let id = org_id.value;
			$("#org_detail")
				.show()
				.html(`<a href="#" id="${id}">${xssTest(orgName)[0].innerHTML}</a>`);
		}
	}

	function showActivityDetail(client, personID) {
		console.log("in showActivityDetail function");
		var actUrl = `https://<%= iparam.pURL%>/v1/persons/${personID}/activities?api_token=<%=iparam.pAPI%>`;
		client.request.get(actUrl).then(
			function (actData) {
				$("#activityLabel").show();
				try {
					var res = JSON.parse(actData.response);
					if (res.data !== null) {
						$("#activity").html("");
						$("#next_activity").html("");
						$("#activity").html(`<p> Today's Activity </p>`);
						showActData(res, client);
					} else {
						// $('#activity').show().html("Activities not found.");
						$("#activity").show().html("Atividades não encontradas.");
						$("#next_activity").html("");
					}
				} catch (error) {
					handleError(
						client,
						"danger",
						"Unexpected error occurred, please try after sometime."
					);
				}
			},
			function () {
				handleError(
					client,
					"danger",
					"Unexpected error occurred, please try after sometime."
				);
			}
		);
	}

	function showActData(res, client) {
		var count = 0;
		var todaysDate = new Date();
		todaysDate.setHours(0, 0, 0, 0);
		for (let i = 0; i < res.data.length; i++) {
			var inputDate = new Date(res.data[i].due_date);
			inputDate.setHours(0, 0, 0, 0);
			if (todaysDate.getTime() === inputDate.getTime()) {
				showTodayActivity(res, i, client);
			} else if (todaysDate < inputDate) {
				count++;
				showNextActivity(res, i, count, client);
			}
		}
	}

	function showTodayActivity(res, i, client) {
		var actDiv = `<div><span class='muted'>Type: </span><span id='tact${i}'></span></div>
                      <div><span class='muted'>Subject: </span> <span id='tacts${i}'> </span></div>`;
		$("#activity").show().append(actDiv);
		$(`#tact${i}`).html(res.data[i].type);
		$(`#tacts${i}`).html(xssTest(res.data[i].subject)[0].innerHTML);
		widgetResize(client);
	}

	function showNextActivity(res, i, count, client) {
		if (count <= 1) {
			var nextActDiv =
				"<p class='m10t'> Next Activity </p><div><span class='muted'>Type:</span> <span id='nexttactn'></span></div>";
			nextActDiv +=
				"<div><span class='muted'>Subject:</span> <span id='nexttactns'></span></div>";
			$("#next_activity").show().html(nextActDiv);
			$("#nexttactn").text(xssTest(res.data[i].type)[0].innerHTML);
			$("#nexttactns").text(xssTest(res.data[i].subject)[0].innerHTML);
			widgetResize(client);
		}
	}

	function instanceModel(client) {
		client.instance.receive(function (event) {
			$(
				"#creatingContact, .detailLabel, #contactError, #contact_detail, #addDeals, #showDeals,#org_detail,#activity,#next_activity"
			).hide();
			$("#loadingMSG").show().html("Loading Please Wait...");
			widgetResize(client);
			var requesterEmail = event.data.message.email;
			iparamData(client, function (iparamsData) {
				var contactArrayKV = iparamsData[1];
				var requiredURL = iparamsData[0];
				setTimeout(function () {
					getPersonID(client, contactArrayKV, requesterEmail, requiredURL);
				}, 5000);
			});
		});
	}
	// to resize the widget
	function widgetResize(client) {
		var height = $(".mywidget").outerHeight(true);
		client.instance.resize({
			height: height + 10,
		});
	}
});
