var formContext;

function calculateRewards()
{
	var selectedOption = getSelectedOption();
	if (selectedOption == "Cashback")
	{
		alert("Feature under development");
	}
	else if (selectedOption == "Rewards")
	{
		var accountId = Xrm.Page.data.entity.getId();
		var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='opportunity'><attribute name='estimatedvalue' alias='totalamount' aggregate='sum'/><filter type='and'><condition attribute='statecode' operator='eq' value='Won'/><condition attribute='parentaccountid' operator='eq' value='" + accountId + "'/></filter></entity></fetch>";
		var result = XrmServiceToolkit.Soap.Fetch(fetchXml);
		var totalAmount = result[0].attributes.totalamount.value;
		var sems_rewardpoints = 0;
		if (totalamount < 1000)
		{
			sems_rewardpoints = totalamount;
		}
		else if (totalamount >= 1000 && totalamount < 25000)
		{
			sems_rewardpoints = totalamount * 3;
		}
		else if (totalAmount >= 25000)
		{
			sems_rewardpoints = totalamount * 5;
		}
        Xrm.Page.getAttribute("new_rewardpoints").setValue(sems_rewardpoints);

	}
}

function getSelectedRewardOption() {
    var radioButtons = document.getElementsByName("rewards");
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            return radioButtons[i].value;
        }
    }
}

function getSelectedCashbackOption() {
    var radioButtons = document.getElementsByName("cashback");
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            return radioButtons[i].value;
        }
    }
}

function getContext()
{
	if (typeof GetGlobalContext !== "undefined")
	{
		return GetGlobalContext().executionContext;
	}
	else if (typeof Xrm !== "undefined")
	{
		return Xrm.Page.context;
	}
	return null;
}

function showCalculateRewardsDialog(primaryControl)
{
	var formContext = primaryControl;
	var accountID = formContext.data.entity.getId();
	var webresourceName = "ssems_rewardsbutton";
	var windowOptions = {
		height: 600,
		width: 700
	};
	Xrm.Navigation.openWebResource(webresourceName, windowOptions, accountID);
}

function updateRewardPoints() {
    var url = window.location.href;
    var dataIndex = url.lastIndexOf("=") + 1;
    var dataLength = url.length;
    var recordData = url.slice(dataIndex, dataLength);
    var processedRecordData = recordData.replace("%20", "").replace("%7b", "").replace("%7d", "");
    console.log(processedRecordData);
    var totalamount = 0;

    if (processedRecordData != null) {
        var loader = showLoader(); // Show loader

        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/opportunities?$select=totalamount&$filter=(_accountid_value eq " + processedRecordData + " and msdyn_forecastcategory eq 100000005)", false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Prefer", "odata.include-annotations=*");
        req.send();

        if (req.status === 200) {
            debugger;
            var results = JSON.parse(req.response);
            console.log(results);

            for (var i = 0; i < results.value.length; i++) {
                var result = results.value[i];
                // Columns
                var opportunityid = result["opportunityid"]; // Guid
                totalamount = totalamount + result["totalamount"]; // Currency
                console.log(totalamount);
            }

            var record = {};
            record.ssems_rewardpoints = totalamount; // Whole Number

            var req = new XMLHttpRequest();
            req.open("PATCH", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/accounts(" + processedRecordData + ")", false);
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
            req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader("Prefer", "odata.include-annotations=*");
            req.send(JSON.stringify(record));

            if (req.status === 204) {
                console.log("Record updated");

                // Introduce a delay using async/await
                const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                (async () => {
                    await delay(3000); // 3 seconds delay before closing
                    hideLoader(loader); // Hide loader
                    showSuccessMessage('Reward points updated successfully! Please refresh the page.');
                    await delay(5000);
                    window.close();

                    // Refresh the parent page
                    if (window.opener && !window.opener.closed) {
                       location.reload(true); // true to force a reload from the server
                    }
                })();
            } else {
                console.log(req.responseText);
                hideLoader(loader); // Hide loader in case of an error
            }
        } else {
            console.log(req.responseText);
            hideLoader(loader); // Hide loader in case of an error
        }
    }
}


function form_onload(executionContext)
{
	formContext = executionContext.getFormContext();
	var wrControl = formContext.getControl("WebResource_Calculate_Rewards");
	if (wrControl)
	{
		wrControl.getContentWindow().then(

		function (contentWindow)
		{
			contentWindow.setClientApiContext(Xrm, formContext);
		})
	}
}