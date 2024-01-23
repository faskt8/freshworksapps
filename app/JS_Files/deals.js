$(document).ready(function () {
	app.initialized().then(
		function (_client) {
			$("#errorMsg").html("");
			var dealsClient = _client;
			getDealsData(dealsClient);
			$(document).on("fwClick", ".wonDeal", function (data) {
				let dealID = data.target.id.split("dealWon")[1];
				$(`#dealWon${dealID}`).prop("disabled", true);
				$(`#dealLost${dealID}`).prop("disabled", true);
				$(
					`#deal${dealID}`
				).html(`<fw-label value="Confirm if the Deal is won" color="blue"></fw-label>
                             <fw-button size="mini" id="yesClicked${dealID}" class="yesClicked won"> Yes </fw-button>
                             <fw-button size="mini" color="danger" id="noClicked${dealID}" class="noClicked"> No </fw-button>`);
			});
			$(document).on("fwClick", ".lostDeal", function (data) {
				let dealID = data.target.id.split("dealLost")[1];
				$(`#dealWon${dealID}`).prop("disabled", true);
				$(`#dealLost${dealID}`).prop("disabled", true);
				$(`#deal${dealID}`).html(`<div>
                             <fw-label value="Confirm if the Deal is lost" color="blue"></fw-label>
                             <fw-button size="mini" id="yesClicked${dealID}" class="yesClicked lost"> Yes </fw-button>
                             <fw-button size="mini" color="danger" id="noClicked${dealID}" class="noClicked"> No </fw-button>
                            </div>`);
			});
			$(document).on("fwClick", ".yesClicked", function (data) {
				let className = data.target.classList[1];
				let dealID = data.target.id.split("yesClicked")[1];
				updateADeal(dealsClient, dealID, className);
				$(`#deal${dealID}`).html("");
			});
			$(document).on("fwClick", ".noClicked", function (data) {
				let dealID = data.target.id.split("noClicked")[1];
				$(`#deal${dealID}`).html("");
				$(`#dealWon${dealID}`).prop("disabled", false);
				$(`#dealLost${dealID}`).prop("disabled", false);
			});
		},
		function () {
			$("#loadingMSG, #showAllDeals").hide();
			$("#errorMsg").html(
				"Unexpected error occurred, please try after sometime."
			);
			closeModal(_client);
		}
	);
	// to get the person's id and required values from iparam's page
	function getDealsData(dealsClient) {
		$("#loadingMSG").show().html("Loading Please Wait...");
		dealsClient.instance.context().then(
			function (data) {
				var personID = data.data.id;
				// to get info from iparam's page
				dealsClient.iparams.get().then(
					function (ddata) {
						var dealsArrayKV = ddata.dealsArrayObj;
						var requiredURL = ddata.pURL;
						getDealsDetails(dealsClient, personID, dealsArrayKV, requiredURL);
					},
					function () {
						$("#loadingMSG, #showAllDeals").hide();
						$("#errorMsg").html(
							"Unexpected error occurred, please try after sometime."
						);
						closeModal(dealsClient);
					}
				);
			},
			function () {
				$("#loadingMSG, #showAllDeals").hide();
				$("#errorMsg").html(
					"Unexpected error occurred, please try after sometime."
				);
				closeModal(dealsClient);
			}
		);
	}
	// get all the related deals to the person
	function getDealsDetails(dealsClient, personID, dealsArrayKV, requiredURL) {
		var url = `https://<%= iparam.pURL%>/v1/persons/${personID}/deals?start=0&status=all_not_deleted&api_token=<%= iparam.pAPI%>`;
		var headers = {
			Accept: "application/json",
		};
		var options = {
			headers: headers,
		};
		dealsClient.request.get(url, options).then(
			function (data) {
				try {
					var dealDetails = JSON.parse(data.response).data;
					var str = [];
					for (var i = 0; i < dealDetails.length; i++) {
						if (dealDetails[i].status === "open") {
							var dealID = dealDetails[i].id;
							// str.push(`<div>
							// Deal Title : <b>${xssTest(dealDetails[i].title)[0].innerHTML}</b>
							//           <a href="https://${requiredURL}/deal/${dealID}" rel="noreferrer" target="_blank">
							//           <i class="fa fa-external-link padding100"></i></a>
							//           <div class="iconClass">
							//                 <fw-button size="small" color="secondary" class="wonDeal" id="dealWon${dealID}"><i title="Deal won" class="tinyLabel material-icons">check</i></fw-button>
							//                 <fw-button size="small" color="secondary"class="lostDeal" id="dealLost${dealID}"><i title="Deal Lost" class="tinyLabel material-icons">cancel</i></fw-button>
							//           </div>
							//           <div id="deal${dealID}"></div>
							//           </div>`);
							str.push(`<div>
                        Deal Title : <b>${
													xssTest(dealDetails[i].title)[0].innerHTML
												}</b>
                                  <a href="https://${requiredURL}/deal/${dealID}" rel="noreferrer" target="_blank">
                                  <i class="fa fa-external-link padding100"></i></a>
                                  <div class="iconClass">
                                        <fw-button size="small" color="secondary" class="wonDeal" id="dealWon${dealID}"><i title="Negócio ganho" class="tinyLabel material-icons">check</i></fw-button>
                                        <fw-button size="small" color="secondary"class="lostDeal" id="dealLost${dealID}"><i title="Negócio perdido" class="tinyLabel material-icons">cancel</i></fw-button>
                                  </div>
                                  <div id="deal${dealID}"></div>
                                  </div>`);
							str.push(`<table class="tableCSS"><thead><th></th>`);
							if (dealDetails !== null) {
								displayDealDetails(dealsArrayKV, dealDetails, str, i);
							} else {
								$("#showAllDeals").html("There are no Deals to display");
							}
						} else if (i === dealDetails.length - 1) {
							if (str.length === 0) {
								str.push(
									`<div>There are no deals present in OPEN status.</div>`
								);
							}
						}
					}
					$("#showAllDeals").show().html(str.join(""));
					$("#loadingMSG").hide();
				} catch (error) {
					$("#loadingMSG, #showAllDeals").hide();
					$("#errorMsg").html(
						"Unexpected error occurred, please try after sometime."
					);
					closeModal(dealsClient);
				}
			},
			function () {
				$("#loadingMSG, #showAllDeals").hide();
				$("#errorMsg").html(
					"Unexpected error occurred, please try after sometime."
				);
				closeModal(dealsClient);
			}
		);
	}

	function displayDealDetails(dealsArrayKV, dealDetails, str, i) {
		for (var j = 0; j < dealsArrayKV.length; j++) {
			let key = dealsArrayKV[j].key;
			var value = dealsArrayKV[j].value;
			if (
				key === "creator_user_id" ||
				key === "org_id" ||
				key === "person_id" ||
				key === "user_id"
			) {
				creatorUserId(key, dealDetails, str, i);
				orgId(key, dealDetails, str, i);
				personId(key, dealDetails, str, i);
				userId(key, dealDetails, str, i);
			} else {
				otherDealData(key, dealDetails, str, i, value);
			}
		}
		str.push("</thead></table><br />");
	}

	function otherDealData(key, dealDetails, str, i, value) {
		if (key !== "title") {
			let result =
				dealDetails[i][key] !== null && dealDetails[i][key] !== undefined
					? dealDetails[i][key]
					: "N/A";
			str.push(`<tr class="divRequirement">
            <td class="muted commonRequirementspan tdpadding">${
							xssTest(value)[0].innerHTML
						}</td>
            <td class="commonRequirementspan w10">${
							xssTest(result)[0].innerHTML
						}</td>
            </tr>`);
		}
	}

	function creatorUserId(key, dealDetails, str, i) {
		if (key === "creator_user_id") {
			let emailid =
				dealDetails[i][key] !== null ? dealDetails[i][key].email : "N/A";
			let name =
				dealDetails[i][key] !== null ? dealDetails[i][key].name : "N/A";
			str.push(`<tr class="divRequirement">
                            <td class="muted commonRequirementspan tdpadding">Creator Email-Id</td>
                            <td class="commonRequirementspan w10">${
															xssTest(emailid)[0].innerHTML
														}</td>
                            </tr>
                            <tr class="divRequirement">
                            <td class="muted commonRequirementspan tdpadding">Creator Name</td>
                            <td class="commonRequirementspan w10">${
															xssTest(name)[0].innerHTML
														}</td>
                            </tr>`);
		}
	}

	function orgId(key, dealDetails, str, i) {
		if (key === "org_id") {
			let name =
				dealDetails[i][key] !== null ? dealDetails[i][key].name : "N/A";
			str.push(`<tr class="divRequirement">
                            <td class="muted commonRequirementspan tdpadding">Organisation Name</td>
                            <td class="commonRequirementspan w10">${
															xssTest(name)[0].innerHTML
														}</td>
                            </tr>`);
		}
	}

	function personId(key, dealDetails, str, i) {
		if (key === "person_id") {
			let emailid =
				dealDetails[i][key] !== null
					? dealDetails[i][key].email[0].value
					: "N/A";
			let name =
				dealDetails[i][key] !== null ? dealDetails[i][key].name : "N/A";
			let phoneNumber =
				dealDetails[i][key].phone[0].value !== ""
					? dealDetails[i][key].phone[0].value
					: "N/A";
			str.push(`<tr class="divRequirement">
                            <td class="muted commonRequirementspan tdpadding">Person EmailId</td>
                            <td class="commonRequirementspan w10">${
															xssTest(emailid)[0].innerHTML
														}</td>
                            </tr>
                            <tr class="divRequirement">
                            <td class="muted commonRequirementspan tdpadding">Person Name</td>
                            <td class="commonRequirementspan w10">${
															xssTest(name)[0].innerHTML
														}</td>
                            </tr>
                            <tr class="divRequirement">
                            <td class="muted commonRequirementspan tdpadding">Person phone Number</td>
                            <td class="commonRequirementspan w10">${
															xssTest(phoneNumber)[0].innerHTML
														}</td>
                            </tr>`);
		}
	}

	function userId(key, dealDetails, str, i) {
		if (key === "user_id") {
			let emailid =
				dealDetails[i][key] !== null ? dealDetails[i][key].email : "N/A";
			let name =
				dealDetails[i][key] !== null ? dealDetails[i][key].name : "N/A";
			str.push(`<tr class="divRequirement">
                            <td class="muted commonRequirementspan tdpadding">User EmailId</td>
                            <td class="commonRequirementspan w10">${
															xssTest(emailid)[0].innerHTML
														}</td>
                            </tr>
                            <tr class="divRequirement">
                            <td class="muted commonRequirementspan tdpadding">User Name</td>
                            <td class="commonRequirementspan w10">${
															xssTest(name)[0].innerHTML
														}</td>
                            </tr>`);
		}
	}

	function updateADeal(dealsClient, dealID, dealStatus) {
		let dealOption = {
			dealID: dealID,
			dealStatus: dealStatus,
		};
		dealsClient.request.invoke("updateDealAfterWon", dealOption).then(
			function (data) {
				let dealStatus = data.response;
				// if (dealStatus === "success") {
				//     $(`#deal${dealID}`).html(`<fw-label value="Deal is WON" color="blue"></fw-label>`);
				// } else {
				//     $(`#deal${dealID}`).html(`<fw-label value="Deal is LOST" color="blue"></fw-label>`);
				// }
				if (dealStatus === "success") {
					$(`#deal${dealID}`).html(
						`<fw-label value="Negócio ganho" color="blue"></fw-label>`
					);
				} else {
					$(`#deal${dealID}`).html(
						`<fw-label value="Negócio perdido" color="blue"></fw-label>`
					);
				}
			},
			function () {
				$(`#dealWon${dealID}`).prop("disabled", false);
				$(`#dealLost${dealID}`).prop("disabled", false);
			}
		);
	}
});
