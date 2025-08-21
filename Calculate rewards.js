function calculateRewards() {
    var selectedOption = getSelectedOption();
    if (selectedOption == "Cashback") {
        alert("Feature under development");
    } else if (selectedOption == "Rewards") {
        var accountId = Xrm.Page.data.entity.getId();
        var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='opportunity'><attribute name='estimatedvalue' alias='totalamount' aggregate='sum'/><filter type='and'><condition attribute='statecode' operator='eq' value='Won'/><condition attribute='parentaccountid' operator='eq' value='" + accountId + "'/></filter></entity></fetch>";
        var result = XrmServiceToolkit.Soap.Fetch(fetchXml);
        var totalAmount = result[0].attributes.totalamount.value;
        var sems_rewardpoints = 0;
        if (totalamount < 1000) {
            sems_rewardpoints = totalamount;
        } else if (totalamount >= 1000 && totalamount < 25000) {
            sems_rewardpoints = totalamount * 3;
        } else if (totalAmount >= 25000) {
            sems_rewardpoints = totalamount * 5;
        }
        Xrm.Page.getAttribute("new_rewardpoints").setValue('new_rewardpoints');
    }
}

function getSelectedOption() {
    var radioButtons = document.getElementsByName("rewards");
    var radioButtons = document.getElementsByName("cashback");
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            return radioButtons[i].value;
        }
    }
}

function showCalculateRewardsDialog() {
    var dialogOptions = new Xrm.DialogOptions();
    dialogOptions.width = 500;
    dialogOptions.height = 250;
    var url = "/WebResources/new_calculate_rewards_dialog.html";
    Xrm.Internal.openDialog(url, dialogOptions, null, null, calculateRewards);
document.getElementById("calculateRewards").addEventListener("click",function(){calculateRewards();} ())

}
