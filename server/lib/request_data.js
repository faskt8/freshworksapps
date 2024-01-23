var base64 = require("base-64");
exports = {
	createPerson: function (args) {
		console.log("in createPerson lib function");
		let pipeURL = args.iparams.pipeURL;
		var baseUrl = `https://${pipeURL}.pipedrive.com/v1/`;

		var personobj = {
			name: base64.decode(args.name),
			email: base64.decode(args.email),
		};
		if (
			args.pipedriveMDMVal != undefined &&
			args.pipedriveMDMVal != null &&
			args.pipedriveMDMVal != ""
		) {
			personobj[`${args.pipedriveMDMID}`] = args.pipedriveMDMVal;
		}
		if (
			args.companyName !== "" &&
			args.companyName !== null &&
			args.companyName !== undefined
		) {
			personobj["org_id"] = base64.decode(args.companyID);
		}
		if (args.phone !== "" && args.phone !== null && args.phone !== undefined) {
			let phone = base64.decode(args.phone);
			personobj["phone"] = phone;
		}
		console.log(personobj);
		var url = baseUrl + "persons?api_token=" + args.iparams.pAPI;
		return {
			method: "POST",
			url: url,
			body: personobj,
			json: true,
		};
	},
	createDeal: function (args) {
		let pipeURL = args.iparams.pipeURL;
		var baseUrl = `https://${pipeURL}.pipedrive.com/v1/`;
		var bodyData = {
			title: base64.decode(args.title),
			value: parseInt(base64.decode(args.value)),
			person_id: base64.decode(args.personID),
		};
		if (
			args.organisationID !== "No Organisation" &&
			args.organisationID !== undefined
		) {
			bodyData["org_id"] = args.organisationID;
		}
		if (args.dealStageID !== null) {
			bodyData["stage_id"] = args.dealStageID;
		}
		if (args.ownerIDAsUserID !== "Select") {
			bodyData["user_id"] = args.ownerIDAsUserID;
		}
		console.log("bodyData ", bodyData);
		var url = baseUrl + "deals?api_token=" + args.iparams.pAPI;
		var headers = {
			Accept: "application/json",
		};
		var options = {
			headers: headers,
		};
		return {
			method: "POST",
			url: url,
			body: bodyData,
			options: options,
			json: true,
		};
	},
	fetchPipeline: function (args) {
		let pipeURL = args.iparams.pipeURL;
		var baseUrl = `https://${pipeURL}.pipedrive.com/v1/`;
		let url = baseUrl + "pipelines?api_token=" + args.iparams.pAPI;
		return {
			method: "GET",
			url: url,
		};
	},
	fetchPipelineStage: function (args) {
		let pipeURL = args.iparams.pipeURL;
		var baseUrl = `https://${pipeURL}.pipedrive.com/v1/`;
		var pipeline_id = base64.decode(args.id);
		let url =
			baseUrl +
			"stages?pipeline_id=" +
			pipeline_id +
			"&api_token=" +
			args.iparams.pAPI;
		return {
			method: "GET",
			url: url,
		};
	},
	fetchOwner: function (args) {
		let pipeURL = args.iparams.pipeURL;
		var baseUrl = `https://${pipeURL}.pipedrive.com/v1/`;
		var url = baseUrl + "users?api_token=" + args.iparams.pAPI;
		return {
			method: "GET",
			url: url,
		};
	},
	getAllProductsFromRequestData: function (args) {
		let pipeURL = args.iparams.pipeURL;
		var baseUrl = `https://${pipeURL}.pipedrive.com/v1/`;
		var url = `${baseUrl}products?start=${args.page}&api_token=${args.iparams.pAPI}`;
		return {
			method: "GET",
			url: url,
		};
	},
	addNote: function (args) {
		let pipeURL = args.iparams.pipeURL;
		var baseUrl = `https://${pipeURL}.pipedrive.com/v1/`;
		var url = baseUrl + "notes?api_token=" + args.iparams.pAPI;
		var headers = {
			Accept: "application/json",
		};
		var options = {
			headers: headers,
		};
		var str = `https://${args.iparams.fdUrl}/a/tickets/${args.ticketID}`;
		var bodyData = {
			content: `${str}`,
			deal_id: args.dealID,
		};
		return {
			method: "POST",
			url: url,
			body: bodyData,
			options: options,
			json: true,
		};
	},
	addProducts: function (args) {
		let pipeURL = args.iparams.pipeURL;
		var baseUrl = `https://${pipeURL}.pipedrive.com/v1/`;
		let deal_id = args.dealID;
		let product_id = args.productID;
		let priceOfProduct = args.productPrice;
		let quantityOfProducts = args.numberOfProducts;
		var url = `${baseUrl}deals/${deal_id}/products?api_token=${args.iparams.pAPI}`;
		var header = {
			Accept: "application/json",
		};
		var body = {
			item_price: priceOfProduct,
			quantity: quantityOfProducts,
			product_id: product_id,
		};
		var options = {
			headers: header,
		};
		return {
			method: "POST",
			url: url,
			body: body,
			options: options,
			json: true,
		};
	},
};
