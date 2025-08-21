function calculateRewardsAndUpdateField() {
    var selectedOption = getSelectedOption();
    if (selectedOption == "Cashback") {
        alert("Feature under development");
    } else if (selectedOption == "Rewards") {
        var accountId = Xrm.Page.data.entity.getId();
        var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='opportunity'><attribute name='estimatedvalue' alias='totalamount' aggregate='sum'/><filter type='and'><condition attribute='statecode' operator='eq' value='Won'/><condition attribute='parentaccountid' operator='eq' value='" + accountId + "'/></filter></entity></fetch>";
        var result = XrmServiceToolkit.Soap.Fetch(fetchXml);
        var totalAmount = result[0].attributes.totalamount.value;
        var rewardPoints = 0;
        if (totalAmount < 1000) {
            rewardPoints = totalAmount; 
        } else if (totalAmount >= 1000 && totalAmount < 25000) {
            rewardPoints = totalAmount * 3;
        } else if (totalAmount >= 25000) {
            rewardPoints = totalAmount * 5;
        }

        // Update the reward points field
        Xrm.Page.getAttribute("ssems_rewardpoints").setValue(rewardPoints);
    }
}

function getSelectedOption() {
    var radioButtons = document.getElementsByName("options");
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            return radioButtons[i].value;
        }
    }
}

function showCalculateRewardsDialog() {
    calculateRewardsAndUpdateField();
}

// Assuming the button ID is "ssems.account.Button2.Button"
document.getElementById("ssems.account.Button2.Button").onclick = function() {
    showCalculateRewardsDialog();
};
