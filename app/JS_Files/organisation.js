$(document).ready(function () {
	app.initialized().then(
		function (_client) {
			var organisationClient = _client;
			getOrganisationData(organisationClient);
		},
		function () {
			$("#loadingMSG, #org_details").hide();
			$("#errorMsg").html(
				"Unexpected error occurred, please try after sometime."
			);
			closeModal(_client);
		}
	);

	function getOrganisationData(organisationClient) {
		$("#loadingMSG").show().html("Loading Please Wait...");
		organisationClient.instance.context().then(
			function (data) {
				var organisationID = data.data.id;
				organisationClient.iparams.get().then(
					function (idata) {
						var requiredURL = idata.pURL;
						var organisationsArrayKV = idata.organisationsArrayObj;
						getOrganisationDetails(
							organisationClient,
							organisationID,
							organisationsArrayKV,
							requiredURL
						);
					},
					function () {
						$("#loadingMSG, #org_details").hide();
						$("#errorMsg").html(
							"Unexpected error occurred, please try after sometime."
						);
						closeModal(organisationClient);
					}
				);
			},
			function () {
				$("#loadingMSG, #org_details").hide();
				$("#errorMsg").html(
					"Unexpected error occurred, please try after sometime."
				);
				closeModal(organisationClient);
			}
		);
	}
	// function to get the deals details related to organisation
	function getOrganisationDetails(
		organisationClient,
		organisationID,
		organisationsArrayKV,
		requiredURL
	) {
		var url = `https://<%= iparam.pURL%>/v1/organizations/${organisationID}?api_token=<%= iparam.pAPI%>`;
		var headers = {
			Accept: "application/json",
		};
		var options = {
			headers: headers,
		};
		organisationClient.request.get(url, options).then(
			function (data) {
				try {
					var organisationDetails = JSON.parse(data.response).data;
					var str1 = [];
					str1.push(`<table class="tableCSS"><thead><th class="divRequirement commonRequirementspan">
            ${xssTest(organisationDetails.name)[0].innerHTML}
            <a href="https://${requiredURL}/organization/${organisationID}" rel="noreferrer" target="_blank">
                <i class="fa fa-external-link padding100"></i></a>
            </th>`);
					conditionChecking(str1, organisationsArrayKV, organisationDetails);
				} catch (error) {
					$("#loadingMSG, #org_details").hide();
					$("#errorMsg").html(
						"Unexpected error occurred, please try after sometime."
					);
					closeModal(organisationClient);
				}
			},
			function () {
				$("#loadingMSG, #org_details").hide();
				$("#errorMsg").html(
					"Unexpected error occurred, please try after sometime."
				);
				closeModal(organisationClient);
			}
		);
	}
	// to reduce the complexity, created function
	function conditionChecking(str1, organisationsArrayKV, organisationDetails) {
		for (var i = 0; i < organisationsArrayKV.length; i++) {
			let key = organisationsArrayKV[i].key;
			let value =
				organisationsArrayKV[i].value !== null
					? organisationsArrayKV[i].value
					: "N/A";
			if (key === "owner_id") {
				ownerid(str1, key, organisationDetails);
			} else {
				let result =
					organisationDetails[key] !== null &&
					organisationDetails[key] !== undefined
						? organisationDetails[key]
						: "N/A";
				str1.push(`<tr class="divRequirement">
                <td class="muted commonRequirementspan">${
									xssTest(value)[0].innerHTML
								}</td>
                <td class="commonRequirementspan w10">${
									xssTest(result)[0].innerHTML
								}</td>
                </tr>`);
			}
		}
		str1.push("</thead></table>");
		$("#org_details").show().html(str1.join(""));
		$("#loadingMSG").hide();
	}

	function ownerid(str1, key, organisationDetails) {
		let nameOwner =
			organisationDetails[key] !== null ? organisationDetails[key].name : "N/A";
		let emailOwner =
			organisationDetails[key] !== null
				? organisationDetails[key].email
				: "N/A";
		// str1.push(`
		//         <tr class="divRequirement">
		//         <td class="muted commonRequirementspan">Owner Name</td>
		//         <td class="commonRequirementspan w10">${xssTest(nameOwner)[0].innerHTML}</td>
		//         </tr>
		//         <tr class="divRequirement">
		//         <td class="muted commonRequirementspan">Owner Email</td>
		//         <td class="commonRequirementspan w10">${xssTest(emailOwner)[0].innerHTML}</td>
		//         </tr>`);
		str1.push(`
                    <tr class="divRequirement">
                    <td class="muted commonRequirementspan">Nome do proprietário</td>
                    <td class="commonRequirementspan w10">${
											xssTest(nameOwner)[0].innerHTML
										}</td>
                    </tr>
                    <tr class="divRequirement">
                    <td class="muted commonRequirementspan">E-mail do proprietário</td>
                    <td class="commonRequirementspan w10">${
											xssTest(emailOwner)[0].innerHTML
										}</td>
                    </tr>
                `);
	}
});
