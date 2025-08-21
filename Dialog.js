//QuoteLibrary Script
function onLoad(ctx) {
    formValidateAndClose(ctx);
    var formContext = ctx.getFormContext();
    formContext.ui.clearFormNotification();
    if (formContext.ui.tabs.get("tab_2"))
        formContext.ui.tabs.get("tab_2").setDisplayState("collapsed");
    onChangeEcommId(ctx);
    //setTermLengthFromProduct(ctx);
    ShowNotificationForAddressId(ctx);
    setPayerCrmAddressInfo(ctx);
    ShowHideUserForecastCriteria(ctx);
    setPaymentTerms(ctx);
    quoteExpNotification(ctx);
    quoteTaxAdvice(ctx);
    quoteTaxTotalAmount(ctx);
    ShowHideEditQuoteTab(ctx);
    validateAddress(ctx);
    UpdatePerpetualTermLengthGrid(ctx);
    //Chcek if PO file is available to download
    checkPoAvailable(ctx);
refreshBulkUpdate();
RetiredProductCheckQuote(ctx)
}

function refreshBulkUpdate(){
 var bulkUpdateWROnloadFunction = function (e) {
			debugger;
			var webResourceControl = Xrm.Page.getControl("WebResource_globalDiscount");
			var src = Xrm.Page.getControl("WebResource_globalDiscount").getSrc();
			src = src.substr(0 , src.length-2) + Math.floor(Math.random()*(99-10+1)+10);
			//console.log(src);
			webResourceControl.setSrc(src); 
			//Xrm.Page.getControl("WebResource_globalDiscount").getSrc()
			};
			 
         Xrm.Page.getControl("WebResource_globalDiscount").setSrc(Xrm.Page.getControl("WebResource_globalDiscount").getSrc()+"11");
			Xrm.Page.getControl("QP_2").addOnLoad(bulkUpdateWROnloadFunction);
}



//This is a temp fix for Quote Revise Button, to avoid multiple clicks 
function quoteRevise() {


    Xrm.Utility.showProgressIndicator("The Process might take a minute, avoid clicking Revise multiple times..");
    setTimeout(quoteReviseDelay, 5000);
}

function quoteReviseDelay() {


    Xrm.Utility.closeProgressIndicator();
    // Xrm.Navigation.openAlertDialog("The Process might take a minute, please wait unit process is complete.");

}

function formValidateAndClose(ctx) {
    var formContext = ctx.getFormContext();
    var recordId = formContext.data.entity.getId();
    if (!recordId) {
        var alertStrings = { confirmButtonLabel: "Ok", text: "Please create the quote from Opportunity record's sub-grid", title: "ERROR!" };
        var alertOptions = { height: 120, width: 500 };
        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
            function success(result) {
                debugger;
                //Don't let the save pop up happen.
                var attributes = formContext.data.entity.attributes.get();
                for (var x in attributes) {
                    attributes[x].setSubmitMode("never");
                }
                debugger;
                formContext.ui.close();
            },
            function (error) {
                console.log(error.message);
            }
        );
    }
}
function quote_onSave(ctx) {

    var formContext = ctx.getFormContext();
    //ensure no updates happen when form is disabled.
    if (formContext.ui.getFormType() == 4) {
        formContext.data.setFormDirty(false);
    }

}

function onChangeEcommId(ctx) {
    var formContext = ctx.getFormContext();

    if (formContext.getAttribute("po_ecommid").getValue() && !formContext.getAttribute("po_quoteinternal").getValue() && formContext.getAttribute("statecode").getValue() == 1)
        formContext.ui.setFormNotification("The quote is published to ecommerce.", "INFO", "ecommpub");
    else
        formContext.ui.clearFormNotification("ecommpub");
}

function quoteExpNotification(ctx) {
    var formContext = ctx.getFormContext();

    if (!formContext.getAttribute("effectiveto"))
        return;

    var date = new Date();

    //override OOB
    if (formContext.getAttribute("effectiveto").getValue() < date) {
        setTimeout(function () {
            formContext.ui.setFormNotification("The \"Quote Expiration Date\" does not contain data or has passed, please update to a future date.", "WARNING", "QuoteExpiryNotification");
        }, 200)
    }
}

function quoteTaxAdvice(ctx) {
    var formContext = ctx.getFormContext();
    var countryName = formContext.getAttribute("billto_country").getValue();
    Xrm.WebApi.online.retrieveMultipleRecords("po_country", "?$select=po_taxcalculationadvice&$filter=po_name eq '"+countryName+"' and statecode eq 0").then(
        function success(results) {
            for (var i = 0; i < results.entities.length; i++) {
                var po_taxcalculationadvice = results.entities[i]["po_taxcalculationadvice@OData.Community.Display.V1.FormattedValue"];
if (po_taxcalculationadvice != undefined  && po_taxcalculationadvice == "Recommend TO Calculate") {
    formContext.ui.setFormNotification("It is recommended TO calculate taxes at this stage when transacting with a customer in " + countryName, "INFO", "QuoteTaxNotification");
}
else if (po_taxcalculationadvice != undefined  && po_taxcalculationadvice == "Recommend to NOT Calculate") {
    formContext.ui.setFormNotification("It is recommended to NOT calculate taxes at this stage when transacting with a customer in " + countryName, "INFO", "QuoteTaxNotification");
}
else{
    formContext.ui.clearFormNotification("QuoteTaxNotification");
}
            }
        },
        function(error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );    
}
//PPTH-152 - Tax Recalculation on change of Quote lines on Draft Quote 
function quoteTaxTotalAmount(ctx) {
    var formContext = ctx.getFormContext();
    var totalAmountChanged = formContext.getAttribute("po_totalamountchanged").getValue();
    
    if (totalAmountChanged == null || totalAmountChanged == false) {
        formContext.ui.clearFormNotification("QuoteTaxTotalAmount");
    }
    else if (totalAmountChanged == true) {
        formContext.ui.setFormNotification("Quote Amount is updated on Quote it is recommended to re-calculate tax.", "WARNING", "QuoteTaxTotalAmount");
    }
}

function termLengthWarning(executionContext) {
    var formContext = executionContext.getFormContext();
    var subscriptiontermlength = formContext.getControl("ps_subscriptiontermlength").getAttribute().getValue();
    var invoicefrequency = formContext.getControl("po_invoicingfrequency").getAttribute().getValue();
    if (invoicefrequency == 936710000) {
        formContext.ui.clearFormNotification("1");
        formContext.ui.clearFormNotification("4");
        formContext.ui.refreshRibbon();
        return;
    }
    var globalContext = Xrm.Utility.getGlobalContext();
    var clientUrl = globalContext.getClientUrl();
    var quoteId = formContext.data.entity.getId().replace("{", "").replace("}", "");
    var req = new XMLHttpRequest();
    req.open("GET", clientUrl + "/api/data/v9.1/quotedetails?$select=po_termlength&$filter=_quoteid_value eq" + " " + quoteId, true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);

                if (results.value.length == 1) {
                    if (subscriptiontermlength != results.value[0]["po_termlength"]) {
                        formContext.ui.clearFormNotification("1");
                        formContext.ui.setFormNotification("Quote length and Products length are not equal", "WARNING", "4");
                        return;
                    }
                    else {
                        formContext.ui.clearFormNotification("1");
                        formContext.ui.clearFormNotification("4");
                        return;

                    }
                }
                else if (results.value.length > 1) {
                    for (var i = 0; i < results.value.length; i++) {
                        var po_termlength = results.value[i]["po_termlength"];
                        if (subscriptiontermlength != results.value[i]["po_termlength"]) {
                            formContext.ui.setFormNotification("Quote length and Products length are not equal", "WARNING", "4");
                            return;
                        }
                        else if (subscriptiontermlength == results.value[i]["po_termlength"]) {
                            for (var j = 1; j < results.value.length; j++) {
                                if (results.value[i]["po_termlength"] != results.value[j]["po_termlength"]) {
                                    formContext.ui.setFormNotification("Quote length and Products length are not equal", "WARNING", "4");
                                    return;
                                }
                                else {
                                    formContext.ui.clearFormNotification("1");
                                    formContext.ui.clearFormNotification("4");
                                    return;


                                }

                            }
                        }
                    }
                }
            } else {
                Xrm.Navigation.openAlertDialog({ text: this.statusText, confirmButtonLabel: "Ok" }, { height: 100, witdth: 200 });
            }
        }
    };
    req.send();
    formContext.ui.refreshRibbon();
}

function showActivateQuote(executionContext) {
    var invoicingFrequency = executionContext.data.entity.attributes.getByName('po_invoicingfrequency').getValue();
    var contractAuthorizationStatus = executionContext.data.entity.attributes.getByName('po_contractauthorizationstatus').getValue();
    var catKif = executionContext.data.entity.attributes.getByName('po_catkif').getValue();
    var vatTaxId = executionContext.data.entity.attributes.getByName('po_vattaxid').getValue();
    if (invoicingFrequency == "936710000" && contractAuthorizationStatus == "936710010" && catKif != null && vatTaxId != null)
        return true;
    else return false;
}

function CheckOrder(executionContext) {
    var catKif = executionContext.data.entity.attributes.getByName('po_catkif').getValue();
    var contractAuthorizationStatus = executionContext.data.entity.attributes.getByName('po_contractauthorizationstatus').getValue();
    if (catKif.length != 6 || contractAuthorizationStatus != "936710010") {
        var alertStrings = { confirmButtonLabel: "Close", text: "One or both of the following conditions to Create an Order has not been satisfied.\n 1. The CAT KIF # does not conform to the expected standard, please review the KIF # in CAT and update it. \n 2. The Contract Authorization Status does not reflect a Status of ï¿½Both Parties Signed Copyï¿½ this indicates a fully executed contract is in place.\nAn order has not been created for the reason(s) above and an update to the Quote is needed.\n Please Click on close button and update the form." };
        var alertOptions = { height: 200, width: 500 };
        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
            function success(result) {
                console.log("Alert dialog closed");
            },
            function (error) {
                console.log(error.message);
            }
        );
    }
    else {
        Sales.QuoteRibbonActions.Instance.acceptQuoteOrCreateOrder(true);
    }
}

function ShowHideUserForecastCriteria(ctx) {

    var formContext = ctx.getFormContext();

    var hasBpf = formContext.data.process.getActiveStage() !== null;

    formContext.getControl("po_userupdatedforecastcriteria").setVisible(hasBpf);


}

function ShowHideEditQuoteTab(ctx) {

    var formContext = ctx.getFormContext();
    var statecode = formContext.getAttribute("statecode");
    if (!formContext.ui.tabs.getByName("tab_6"))
        return;
    var statecodeVal = typeof statecode.getValue == "function" ? statecode.getValue() : null;

    formContext.ui.tabs.getByName("tab_6").setVisible(statecodeVal == 1);
    formContext.data.refresh();

}

function EnforceInvoiceFrequency(executionContext) {
    var formContext = executionContext.getFormContext();
    var invoicingFrequency = formContext.getAttribute("po_invoicingfrequency").getValue();
    if (invoicingFrequency == "936710001" || invoicingFrequency == "936710002" || invoicingFrequency == "936710003") {

    }
}

function showHideCreateOrder(executionContext) {
    var quoteState = executionContext.data.entity.attributes.getByName('statecode').getValue();
    var quoteStatus = executionContext.data.entity.attributes.getByName('statuscode').getValue();
    alert(quoteState);
    alert(quoteStatus);
    switch (quoteState) {
        case "0": {
            if (quoteStatus == "100000000" || quoteStatus == "1")
                return false;
            else return true;
            break;
        }
        case "1": {
            if (quoteStatus == "2" || quoteStatus == "3")
                return true;
            else return false;
            break;
        }
        case "2": {
            if (quoteStatus == "4")
                return false;
            else return true;
            break;
        }
        case "3": {
            if (quoteStatus == "5" || quoteStatus == "6" || quoteStatus == "7")
                return false;
            else return true;
            break;
        }
        default: {
            break;
        }
    }
}

function availableBalanceWarning(executionContext, alertString) {
    var quoteTotalAmount = executionContext.getFormContext().getAttribute('totalamount').getValue();
    if (executionContext.getFormContext().getAttribute("po_account").getValue() != null) {
        var accountGuid = executionContext.getFormContext().getAttribute("po_account").getValue()[0].id;
        var alertOptions = { height: 130, width: 570 };
        Xrm.WebApi.retrieveRecord("account", accountGuid, "?$select=ps_availablebalance").then(
            function success(result) {
                var accountPsAvailableBalance = result.ps_availablebalance;
                if (quoteTotalAmount != null && accountPsAvailableBalance != null) {
                    if (quoteTotalAmount > accountPsAvailableBalance) {
                        alertString += " The Quote Total is greater than the Accounts Available Balance.";
                        Xrm.Navigation.openAlertDialog({ text: alertString }, alertOptions);
                    } else {
                        if (alertString != "" && alertString != null && alertString != "undefined") {
                            Xrm.Navigation.openAlertDialog({ text: alertString }, alertOptions);
                        }
                    }
                }
                else {
                    if (alertString != "" && alertString != null && alertString != "undefined") {
                        Xrm.Navigation.openAlertDialog({ text: alertString }, alertOptions);
                    }
                }
            }
            , function (result) { return false; }
        );
    }
    else {
        if (alertString != "" && alertString != null && alertString != "undefined") {
            Xrm.Navigation.openAlertDialog({ text: alertString }, alertOptions);
        }
    }
}

function delinquencyStatusWarning(executionContext) {
    var delinquencyStatus = executionContext.getFormContext().getAttribute("po_delinquencystatus").getValue();
    if (delinquencyStatus == "717790001") {
        var alertString = { text: "This Account is In-Dispute, Delinquency Status" };
        var alertOptions = { height: 120, width: 400 };
        Xrm.Navigation.openAlertDialog(alertString, alertOptions);
    }
}

function colourDelinquencyStatusField(executionContext) {
    var delinquencyStatus = executionContext.getFormContext().getAttribute("po_delinquencystatus").getValue();
    var alertString = "";
    switch (delinquencyStatus) {
        case 717790000:
            window.parent.document.getElementById('Delinquency Status_label').style = 'background-color:#eb1946;color :#eb1946;';
            alertString = "This Account is Delinquent, Delinquency Status \n \n ";
            break;
        case 717790001:
            window.parent.document.getElementById('Delinquency Status_label').style = 'background-color : #fab914;color : #fab914;';
            break;
        case 717790002:
            window.parent.document.getElementById('Delinquency Status_label').style = 'background-color : #bed732 ; color : #bed732;';
            break;
    }
    availableBalanceWarning(executionContext, alertString);
}

function invoiceFrequencyAlert(executionContext) {
    var subScriptionTermLength = executionContext.getFormContext().getAttribute("ps_subscriptiontermlength").getText();
    var invoicingFrequency = executionContext.getFormContext().getAttribute("po_invoicingfrequency").getValue();
    var totalPaymentAmount = executionContext.getFormContext().getAttribute("totalamount").getValue();
    var alertMsg = "false";
    var paymentPeriods = subScriptionTermLength.replace(/[^0-9\.]+/g, "");
    if (totalPaymentAmount != 0 && paymentPeriods != "" && totalPaymentAmount != null) {
        switch (invoicingFrequency) {
            case 936710001:
                if (totalPaymentAmount / 1 * paymentPeriods < 0) {
                    alertMsg = "True";
                } break;
            case 936710002:
                if (totalPaymentAmount / 4 * paymentPeriods < 100000) {
                    alertMsg = "True";
                } break;
            case 936710003:
                if (totalPaymentAmount / 12 * paymentPeriods < 50000) {
                    alertMsg = "True";
                } break;
            default:
                alertMsg = "false";
                break;
        }
        if (alertMsg == "True") {
            var alertString = { text: " Warning Message(TCV): \n\n Total Contract Value does not Qualify for invoicing requirements.\n\n Invoicing Frequency = Annual then Invoicing Payment > 0 K \n\n Invoicing Frequency = Quarterly then Invoicing Payment > 100K \n\n Invoicing Frequency = Monthly then Invoicing Payment > 50k " };
            var alertOptions = { height: 300, width: 550 };
            Xrm.Navigation.openAlertDialog(alertString, alertOptions);
        }
    }
}

function hideQuotePrintButton(executionContext) {
    return true;
    var paymentScheduleamount = executionContext.data.entity.attributes.getByName('ps_paymentscheduleamount').getValue();
    var subscriptiontermlength = executionContext.data.entity.attributes.getByName('ps_subscriptiontermlength').getValue();
    var invoicingFrequency = executionContext.data.entity.attributes.getByName('po_invoicingfrequency').getValue();
    if (invoicingFrequency == 936710000) {
        return true;
    }

    if (paymentScheduleamount != null && invoicingFrequency != null) {

        if (invoicingFrequency == 936710001 && paymentScheduleamount > 0) {

            var isEqualTermLength = validateQuoteLine(subscriptiontermlength, formContext);
            if (isEqualTermLength) {
                return true;
            }
            else {
                return false;
            }
        }

        else if (invoicingFrequency == 936710002 && paymentScheduleamount > 100000) {

            var isEqualTermLength = validateQuoteLine(subscriptiontermlength, formContext);
            if (isEqualTermLength) {
                return true;
            }
            else {
                return false;
            }
        }

        else if (invoicingFrequency == 936710003 && paymentScheduleamount > 50000) {

            var isEqualTermLength = validateQuoteLine(subscriptiontermlength, formContext);
            if (isEqualTermLength) {
                return true;
            }
            else {
                return false;
            }
        }


    }

    else {
        return false;
    }

}

function availableBalanceWarning(executionContext, alertString) {
    var quoteTotalAmount = executionContext.getFormContext().getAttribute('totalamount').getValue();
    if (executionContext.getFormContext().getAttribute("po_account").getValue() != null) {
        var accountGuid = executionContext.getFormContext().getAttribute("po_account").getValue()[0].id;
        var alertOptions = { height: 130, width: 570 };
        Xrm.WebApi.retrieveRecord("account", accountGuid, "?$select=ps_availablebalance").then(
            function success(result) {
                var accountPsAvailableBalance = result.ps_availablebalance;
                if (quoteTotalAmount != null && accountPsAvailableBalance != null) {
                    if (quoteTotalAmount > accountPsAvailableBalance) {
                        alertString += " The Quote Total is greater than the Accounts Available Balance.";
                        Xrm.Navigation.openAlertDialog({ text: alertString }, alertOptions);
                    } else {
                        if (alertString != "" && alertString != null && alertString != "undefined") {
                            Xrm.Navigation.openAlertDialog({ text: alertString }, alertOptions);
                        }
                    }
                }
                else {
                    if (alertString != "" && alertString != null && alertString != "undefined") {
                        Xrm.Navigation.openAlertDialog({ text: alertString }, alertOptions);
                    }
                }
            }
            , function (result) { return false; }
        );
    }
    else {
        if (alertString != "" && alertString != null && alertString != "undefined") {
            Xrm.Navigation.openAlertDialog({ text: alertString }, alertOptions);
        }
    }
}

function changeInvoiceFrequency(executionContext) {
    var invoicingFrequency = executionContext.getFormContext().getAttribute("po_invoicingfrequency").getValue();
    var contractAuthorizationStatus = executionContext.getFormContext().getAttribute("po_contractauthorizationstatus").getValue();
    var catKif = executionContext.getFormContext().getAttribute('po_catkif').getValue();
    var vatTaxId = executionContext.getFormContext().getAttribute('po_vattaxid').getValue();
    var quoteSubScriptionTermLength = executionContext.getFormContext().getAttribute("ps_subscriptiontermlength").getValue();

    if (invoicingFrequency != "936710000" && contractAuthorizationStatus == "936710010" && catKif != null && vatTaxId != null) {
        var getQuoteLineGrid = executionContext.getFormContext().getControl("QP_2").getGrid();
        var getQuoteLineRowsCount = getQuoteLineGrid.getTotalRecordCount();
        var getQuoteLineRows = getQuoteLineGrid.getRows();
        var rows = 0;
        getQuoteLineRows.forEach(function (selectedRow, rows) {
            entityGuid = selectedRow.getData().getEntity().getId();
            console.log(entityGuid);
            Xrm.WebApi.retrieveRecord("quotedetail", entityGuid, "?$select=extendedamount,po_termlength").then(
                function success(result) {
                    console.log(result.extendedamount);
                    console.log(result.po_termlength);
                    if (quoteSubScriptionTermLength == result.po_termlength) {

                    } else {
                    }
                }
                , function (result) {
                }
            );
            rows++;
        });
    }
}

function quotePrintButtonAlert(executionContext) {
    var formContext = executionContext.getFormContext();
    var paymentScheduleamount = executionContext.getFormContext().getAttribute("ps_paymentscheduleamount").getValue();;
    var invoicingFrequency = executionContext.getFormContext().getAttribute("po_invoicingfrequency").getValue();;
    var subscriptiontermlength = executionContext.getFormContext().getAttribute("ps_subscriptiontermlength").getValue();
    if (invoicingFrequency == 936710000) {
        executionContext.getFormContext().ui.clearFormNotification("1");
        executionContext.getFormContext().ui.clearFormNotification("4");
        return;
    }

    if (paymentScheduleamount != null && invoicingFrequency != null) {

        if (invoicingFrequency == 936710001 && paymentScheduleamount > 0) {

            var isEqualTermLength = validateQuoteLine(subscriptiontermlength, formContext);
            if (isEqualTermLength) {
                return true;
            }


            else {

                executionContext.getFormContext().ui.setFormNotification("Quote length and Products length are not equal", "WARNING", "1");
            }
        }

        else if (invoicingFrequency == 936710002 && paymentScheduleamount > 100000) {

            var isEqualTermLength = validateQuoteLine(subscriptiontermlength, formContext);
            if (isEqualTermLength) {
                return true;
            }
            else {
                executionContext.getFormContext().ui.setFormNotification("Quote length and Products length are not equal", "WARNING", "1");
            }
        }

        else if (invoicingFrequency == 936710003 && paymentScheduleamount > 50000) {

            var isEqualTermLength = validateQuoteLine(subscriptiontermlength, formContext);
            if (isEqualTermLength) {
                return true;
            }
            else {
                executionContext.getFormContext().ui.setFormNotification("Quote length and Products length are not equal", "WARNING", "1");
            }
        }


    }

    else {
        var isEqualTermLength = validateQuoteLine(subscriptiontermlength, formContext);
        if (!isEqualTermLength) {
            executionContext.getFormContext().ui.setFormNotification("Quote length and Products length are not equal", "WARNING", "1");

        }

    }

}

function validateQuoteLine(subscriptiontermlength, formContext) {

    var quoteId = formContext.data.entity.getId().replace("{", "").replace("}", "");
    var subscriptiontermLength = subscriptiontermlength;

    var globalContext = Xrm.Utility.getGlobalContext();
    var clientUrl = globalContext.getClientUrl();

    var count = 0;
    var termFlag;
    var req = new XMLHttpRequest();
    req.open("GET", clientUrl + "/api/data/v9.1/quotedetails?$select=po_termlength&$filter=_quoteid_value eq" + " " + quoteId, true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (results.value.length == 1) {
                    if (subscriptiontermlength != results.value[0]["po_termlength"]) {
                        termFlag = false;
                    }
                }
                else if (results.value.length > 1) {
                    for (var i = 0; i < results.value.length; i++) {
                        if (termFlag == false) {
                            break;
                        }
                        var po_termlength = results.value[i]["po_termlength"];
                        if (subscriptiontermlength != results.value[i]["po_termlength"]) {
                            termFlag = false;
                            break;
                        }
                        else if (subscriptiontermlength == results.value[i]["po_termlength"]) {
                            for (var j = 1; j < results.value.length; j++) {

                                if (results.value[i]["po_termlength"] != results.value[j]["po_termlength"]) {
                                    termFlag = false;
                                    break;
                                }
                            }
                        }
                    }
                }

            } else {
                Xrm.Navigation.openAlertDialog({ text: this.statusText, confirmButtonLabel: "Ok" }, { height: 100, witdth: 200 });
            }
        }
    };
    req.send();
    if (termFlag == false) {
        return termFlag;
    }
    else {
        return true;
    }

}

function CreditLimitCheck(primaryControl, isOrderCreate) {

    var formContext = typeof primaryControl.getFormContext == "function" ? primaryControl.getFormContext() : primaryControl;
    var quoteGuid = formContext.data.entity.getId();
    quoteGuid = quoteGuid.replace(/[{}]/g, "");
    var globalContext = Xrm.Utility.getGlobalContext();
    var clientUrl = globalContext.getClientUrl();
    var warningMsg = "";
    // Credit Status Check
    // Get Account ID
    var quoteVars = [
        Xrm.WebApi.online.retrieveRecord("quote", quoteGuid, "?$select=_po_account_value,totalamount_base").then(
            function success(result) {
                var _po_account_value = result["_po_account_value"];
                var _po_account_value_formatted = result["_po_account_value@OData.Community.Display.V1.FormattedValue"];
                var _po_account_value_lookuplogicalname = result["_po_account_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                var totalamount_base = result["totalamount_base"];
                var totalamount_base_formatted = result["totalamount_base@OData.Community.Display.V1.FormattedValue"];
                return { _po_account_value: _po_account_value, totalamount_base: totalamount_base }
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        )
    ]
    return $.when.apply($, quoteVars).then(function (qVar) {
        // Get Credit Status and Account Number

        return Xrm.WebApi.online.retrieveRecord("account", qVar._po_account_value, "?$select=accountnumber,po_creditmanagementcreditstatus,po_creditmanagementavailablebalance").then(
            function success(result) {
                var accountnumber = result["accountnumber"];
                var po_creditmanagementcreditstatus = result["po_creditmanagementcreditstatus"];
                var po_creditmanagementcreditstatus_formatted = result["po_creditmanagementcreditstatus@OData.Community.Display.V1.FormattedValue"];
                var po_creditmanagementavailablebalance = result["po_creditmanagementavailablebalance"];
                var po_creditmanagementavailablebalance_formatted = result["po_creditmanagementavailablebalance@OData.Community.Display.V1.FormattedValue"];

                var code = "";

                //no need to check anything
                if (formContext.getAttribute("po_bypasscreditcheck").getValue())
                    return code;


                if (!isOrderCreate) {
                    switch (po_creditmanagementcreditstatus) {
                        //D1
                        case 936710001:
                            {
                                //M1
                                executeWorkflow(quoteGuid, "DC79E256-37FA-4999-A1FB-5A4DB80AF0D7", clientUrl);
                                warningMsg += "Account number " + accountnumber + " is in overdue status. At least one invoice is overdue for more than 30 days. Please review open invoices and work with the customer to resolve the overdue issue at the earliest. ";
                                code = "M1";
                            }
                            break;
                        //D2          
                        case 936710002:
                            {
                                executeWorkflow(quoteGuid, "EB69D5F1-8F90-4C87-B439-1EEA5042D805", clientUrl);
                                warningMsg += "Account number " + accountnumber + " is in overdue status. At least one of the invoices are overdue for more than 60 days. Please review open invoices and work with customer to resolve the overdue issue at the earliest. Orders may get blocked against this customer account until the overdue invoices have been paid."

                                code = "M2";

                            }
                            break;
                        //D3
                        case 936710003:
                            {
                                //M2
                                executeWorkflow(quoteGuid, "EB69D5F1-8F90-4C87-B439-1EEA5042D805", clientUrl);
                                warningMsg += "Account number " + accountnumber + " is in overdue status. At least one of the invoices are overdue for more than 90 days. Please review open invoices and work with customer to resolve the overdue issue before any new orders can be created. Please send exception approvals to deals.bfc@hcl.com to proceed further with this order if this order is critical.";
                                code = "M2";
                            }
                            break;
                        default:
                            break;
                    }
                    // Check Available Credit
                    if (po_creditmanagementavailablebalance != null && qVar.totalamount_base != null) {
                        if (qVar.totalamount_base > po_creditmanagementavailablebalance) {
                            //M3
                            executeWorkflow(quoteGuid, "6A41BECE-4779-4568-93B5-E82A251FFF99", clientUrl);
                            warningMsg += "***Account number " + accountnumber + " exceeds the credit limit set for this account. Please contact <deals.bfc@hcl.com> for reviewing credit limits. Please note that you may not be able to create the order if you do not have a sufficient credit limit. ";

                            code = "M3";
                        }
                    }

                }
                ///if comes from order
                else {
                    //if D3 STOP
                    if (po_creditmanagementcreditstatus == 936710003) {
                        executeWorkflow(quoteGuid, "EB69D5F1-8F90-4C87-B439-1EEA5042D805", clientUrl);
                        warningMsg += "Account number " + accountnumber + " is in overdue status. At least one of the invoices are overdue for more than 90 days. Please review open invoices and work with customer to resolve the overdue issue before any new orders can be created. Please send exception approvals to deals.bfc@hcl.com to proceed further with this order if this order is critical.";
                        code = "M2"

                    }
                    if (po_creditmanagementavailablebalance != null && qVar.totalamount_base != null) {
                        if (qVar.totalamount_base > po_creditmanagementavailablebalance) {
                            //M3
                            executeWorkflow(quoteGuid, "6A41BECE-4779-4568-93B5-E82A251FFF99", clientUrl);
                            warningMsg += "***Account number " + accountnumber + " exceeds the credit limit set for this account. Please contact <deals.bfc@hcl.com> for reviewing credit limits. Please note that you may not be able to create the order if you do not have a sufficient credit limit. ";
                            if (!code)
                                code = "M3";
                        }
                    }
                }

                if (warningMsg != "") {
                    Xrm.Navigation.openAlertDialog({ text: warningMsg }, { height: 280, width: 530 }).then(
                        function success(result) {
                            console.log("Alert dialog closed");
                        },
                        function (error) {
                            console.log(error.message);
                        }

                    );
                }

                return code;
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);

                return "ERROR";
            }
        )
    });

}

function executeWorkflow(quoteId, workflowId, clientUrl) {
    var functionName = "executeWorkflow >>";
    var query = "";
    try {

        //Define the query to execute the action
        query = "workflows(" + workflowId.replace("}", "").replace("{", "") + ")/Microsoft.Dynamics.CRM.ExecuteWorkflow";

        var data = {
            "EntityId": quoteId
        };

        var req = new XMLHttpRequest();
        req.open("POST", clientUrl + "/api/data/v8.2/" + query, true);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");

        req.onreadystatechange = function () {

            if (this.readyState == 4 /* complete */) {
                req.onreadystatechange = null;

                if (this.status == 200) {
                    //success callback this returns null since no return value available.
                    var result = JSON.parse(this.response);


                } else {
                    //error callback
                    var error = JSON.parse(this.response).error;
                }
            }
        };
        req.send(JSON.stringify(data));

    } catch (e) {
        console.log("Error while calling WF: " + e);
    }
}

function setPayerCrmAddressInfo(ctx) {



    var formContext = ctx.getFormContext();

    //don't do anything if closed already
    if (formContext.ui.getFormType() == 4)
        return;

    var account = formContext.getAttribute("po_account").getValue();

    if (account) {

        Xrm.WebApi.retrieveRecord("account", account[0].id.replace("{", "").replace("}", ""), "?$select=accountnumber,po_sapnumber").then(
            function success(r) {
                if (r.accountnumber)
                    formContext.getAttribute("po_payeraddresscrmid").setValue(r.accountnumber);
                if (r.po_sapnumber)
                    formContext.getAttribute("po_payersapnumber").setValue(r.po_sapnumber);
            },
            function (error) {
                console.log(error);
            });

    }
    else {

        formContext.getAttribute("po_payeraddresscrmid").setValue(null);
        formContext.getAttribute("po_payersapnumber").setValue(null);
    }
}

function ShowNotificationForAddressId(exeContext) {
    var formContext = exeContext.getFormContext();
    if (formContext.getAttribute("po_billtoaddresscrmid") && formContext.getAttribute("po_shiptoaddresscrmid") && formContext.getAttribute("po_payeraddresscrmid")) {
        var billAddressId = formContext.getAttribute("po_billtoaddresscrmid").getValue();
        var shipAddressId = formContext.getAttribute("po_shiptoaddresscrmid").getValue();
        var payerAddressId = formContext.getAttribute("po_payeraddresscrmid").getValue();
        if (billAddressId == null || shipAddressId == null || payerAddressId == null) {
            formContext.ui.setFormNotification("Please select addresses to advance pipeline", "ERROR", "10");
        }
        else {
            formContext.ui.clearFormNotification("10");
        }
    }
}

function setPaymentTerms(executionContext) {
    var formContext = executionContext.getFormContext();
    var globalContext = Xrm.Utility.getGlobalContext();
    var clientUrl = globalContext.getClientUrl();

    if (formContext.ui.getFormType() == 1 || formContext.ui.getFormType() == 2) {
        if (formContext.getAttribute("po_paymentterms").getValue() == null && formContext.getAttribute("po_account").getValue() != null) {
            try {
                var requestText = "/api/data/v9.1/accounts(" + formContext.getAttribute('po_account').getValue()[0].id + ")?$select=_po_paymentterms_value";
                requestText = requestText.replace(/[{}]/g, "");
                var req = new XMLHttpRequest();
                req.open("GET", clientUrl + requestText, true);
                req.setRequestHeader("OData-MaxVersion", "4.0");
                req.setRequestHeader("OData-Version", "4.0");
                req.setRequestHeader("Accept", "application/json");
                req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                req.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        req.onreadystatechange = null;
                        if (this.status === 200) {
                            var result = JSON.parse(this.response);
                            var _po_paymentterms_value = result["_po_paymentterms_value"];
                            var _po_paymentterms_value_formatted = result["_po_paymentterms_value@OData.Community.Display.V1.FormattedValue"];
                            var _po_paymentterms_value_lookuplogicalname = result["_po_paymentterms_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                            var lookupVal = new Array();
                            lookupVal[0] = new Object();
                            lookupVal[0].id = _po_paymentterms_value;
                            lookupVal[0].name = _po_paymentterms_value_formatted;
                            lookupVal[0].entityType = _po_paymentterms_value_lookuplogicalname;

                            formContext.getAttribute("po_paymentterms").setValue(lookupVal);
                        } else {
                            Xrm.Navigation.openAlertDialog({ text: this.statusText, confirmButtonLabel: "Ok" }, { height: 100, witdth: 200 });
                        }
                    }
                };
                req.send();

            } catch (e) {
                console.log("Error while calling WF: " + e);
            }
        }
    }
}

function validateAddress(exeContext) {
    var formContext = exeContext.getFormContext();
    var billto_name = formContext.getAttribute("billto_name").getValue();
    var shipto_name = formContext.getAttribute("shipto_name").getValue();
    if (shipto_name == null || billto_name == null) {
        //formContext.ui.setFormNotification("Please Open the Address with 'null' value for contact and associate a Contact to the Address. //Please re-select the addresses on your DRAFT Quote AND click the grey button 'OPEN ADDRESS' and select a Contact and save the //Address record.", "ERROR", "10");
    }
}

function setTermLengthFromProduct(exeContext) {
    var globalContext = Xrm.Utility.getGlobalContext();
    var clientUrl = globalContext.getClientUrl();
    var formContext = exeContext.getFormContext();
    var quoteId = formContext.data.entity.getId().replace("{", "").replace("}", "");
    var req = new XMLHttpRequest();
    req.open("GET", clientUrl + "/api/data/v9.1/quotedetails?$select=_productid_value,quotedetailid&$filter=_quoteid_value eq " + quoteId + " and _productid_value ne null", false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                for (var i = 0; i < results.value.length; i++) {
                    var _productid_value = results.value[i]["_productid_value"];
                    var quotedetailid = results.value[i]["quotedetailid"];
                    var req1 = new XMLHttpRequest();
                    req1.open("GET", clientUrl + "/api/data/v9.1/products(" + _productid_value + ")?$select=po_termlength", false);
                    req1.setRequestHeader("OData-MaxVersion", "4.0");
                    req1.setRequestHeader("OData-Version", "4.0");
                    req1.setRequestHeader("Accept", "application/json");
                    req1.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                    req1.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                    req1.onreadystatechange = function () {
                        if (this.readyState === 4) {
                            req1.onreadystatechange = null;
                            if (this.status === 200) {
                                var result1 = JSON.parse(this.response);
                                var tl = result1["po_termlength"];
                                var entity = {};
                                entity.po_termlength = tl;
                                var req2 = new XMLHttpRequest();
                                req2.open("PATCH", clientUrl + "/api/data/v9.1/quotedetails(" + quotedetailid + ")", false);
                                req2.setRequestHeader("OData-MaxVersion", "4.0");
                                req2.setRequestHeader("OData-Version", "4.0");
                                req2.setRequestHeader("Accept", "application/json");
                                req2.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                                req2.onreadystatechange = function () {
                                    if (this.readyState === 4) {
                                        req2.onreadystatechange = null;
                                        if (this.status === 204) {
                                            //Success - No Return Data - Do Something
                                        } else {
                                            Xrm.Utility.alertDialog(this.statusText);
                                        }
                                    }
                                };
                                req2.send(JSON.stringify(entity));

                            } else {
                                Xrm.Utility.alertDialog(this.statusText);
                            }
                        }
                    };
                    req1.send();
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
}

function UpdatePerpetualTermLengthGrid(exeContext) {
    var globalContext = Xrm.Utility.getGlobalContext();
    var clientUrl = globalContext.getClientUrl();
    var formContext = exeContext.getFormContext();
    var quoteId = formContext.data.entity.getId().replace("{", "").replace("}", "");
    var req = new XMLHttpRequest();
    req.open("GET", clientUrl + "/api/data/v9.1/quotedetails?$select=_productid_value,quotedetailid&$filter=_quoteid_value eq " + quoteId + " and _productid_value ne null", false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                for (var i = 0; i < results.value.length; i++) {
                    var _productid_value = results.value[i]["_productid_value"];
                    var quotedetailid = results.value[i]["quotedetailid"];
                    var req1 = new XMLHttpRequest();
                    req1.open("GET", clientUrl + "/api/data/v9.1/products(" + _productid_value + ")?$select=po_termlength,po_licensetype", false);
                    req1.setRequestHeader("OData-MaxVersion", "4.0");
                    req1.setRequestHeader("OData-Version", "4.0");
                    req1.setRequestHeader("Accept", "application/json");
                    req1.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                    req1.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                    req1.onreadystatechange = function () {
                        if (this.readyState === 4) {
                            req1.onreadystatechange = null;
                            if (this.status === 200) {
                                var result1 = JSON.parse(this.response);
                                var tl = result1["po_licensetype"];
                                if (t1 == 936710000) {
                                    var entity = {};
                                    entity.po_termlength = 936710007;
                                    var req2 = new XMLHttpRequest();
                                    req2.open("PATCH", clientUrl + "/api/data/v9.1/quotedetails(" + quotedetailid + ")", false);
                                    req2.setRequestHeader("OData-MaxVersion", "4.0");
                                    req2.setRequestHeader("OData-Version", "4.0");
                                    req2.setRequestHeader("Accept", "application/json");
                                    req2.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                                    req2.onreadystatechange = function () {
                                        if (this.readyState === 4) {
                                            req2.onreadystatechange = null;
                                            if (this.status === 204) {
                                                //Success - No Return Data - Do Something
                                            } else {
                                                Xrm.Utility.alertDialog(this.statusText);
                                            }
                                        }
                                    };
                                    req2.send(JSON.stringify(entity));
                                }

                            } else {
                                Xrm.Utility.alertDialog(this.statusText);
                            }
                        }
                    };
                    req1.send();
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
}


function displayRuleReviseBtn(exeContext)
{
debugger;
if (exeContext.getAttribute("statuscode").getValue() == 936710015)
{
    return false;
}
else
{
    return true;
}
}


function RetiredProductCheckQuote(exeContext){
var formContext = exeContext.getFormContext();
if (formContext.ui.getFormType() == 1) {
    return;
}
var recId = formContext.data.entity.getId();
var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>"+
"<entity name='quotedetail'>"+
  "<attribute name='productid' />"+
  "<attribute name='quantity' />"+
  "<attribute name='quotedetailid' />"+
  "<filter type='and'>"+
    "<condition attribute='quoteid' operator='eq' uitype='quote' value='"+recId+"' />"+
  "</filter>"+
  "<link-entity name='product' from='productid' to='productid' link-type='inner' alias='ac'>"+
    "<filter type='and'>"+
      "<condition attribute='statecode' operator='eq' value='1' />"+
    "</filter>"+
  "</link-entity>"+
"</entity>"+
"</fetch>";
fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
Xrm.WebApi.online.retrieveMultipleRecords("quotedetail", fetchXml).then(
    function success(results) {
        if (results.entities.length > 0) {
            var msg = "The Quote Line(s) of the Quote is having retired products. Please remove the retired products."
            for (var i = 0; i < results.entities.length; i++) {
                var quotedetailid = results.entities[i]["quotedetailid"];
                var productName = results.entities[i]["_productid_value@OData.Community.Display.V1.FormattedValue"];
                msg = msg + "\n Product: "+productName;
            }

            Xrm.Navigation.openErrorDialog({ message:msg }).then(
                function (success) {
                    console.log(success);        
                },
                function (error) {
                    console.log(error);
                });
        }        
    },
    function(error) {
        Xrm.Utility.alertDialog(error.message);
    }
);

}

//Chcek if PO file is available to download
function checkPoAvailable(ctx) {
    var formContext = ctx.getFormContext();
    var filename = formContext.getAttribute("po_pofilename") ? formContext.getAttribute("po_pofilename").getValue() : null;
    //If PO file available to download, Display notification onload of form
    if (filename != null) {
        formContext.ui.setFormNotification("PO is available to download", "INFO", "poAvailable");
    }
}

//CRM-7610: Make the field 'Requested Payment Terms' Read Only if it contains data
function MakeRequestedPaymentTermsReadOnly(exectx) {
    var formContext = exectx.getFormContext();
    var reqPaymentTerms = formContext.getAttribute("po_requestedpaymentterm") ? formContext.getAttribute("po_requestedpaymentterm").getValue() : null;    
    if (reqPaymentTerms != null) {
        //Lock Requested Payment Terms        
        formContext.getControl("po_requestedpaymentterm").setDisabled(true);
    }
}
//End CRM-7610

// CRM-10080 : correct HCL Entity value on change of Account on Quote
function SetHCLEntityFromCountry(executionContext, sourceFieldName, targetFieldName) {
    var formContext = executionContext.getFormContext();
    var countryName = formContext.getAttribute(sourceFieldName).getValue();
    if (countryName == null) {
        //formContext.getAttribute("po_hclentity").setValue(null);
        return;
    }
    var req = new XMLHttpRequest();
    //req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/po_countries?$select=_po_hclentity_value&$filter=statecode eq 0 and po_name eq '" + countryName[0].name + "'", true);
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/po_countries(" + countryName[0].id.replace("{", "").replace("}", "") + ")?$select=_po_hclentity_value", true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                //for (var i = 0; i < results.value.length; i++) {
                var _po_hclentity_value = results["_po_hclentity_value"];
                var _po_hclentity_value_formatted = results["_po_hclentity_value@OData.Community.Display.V1.FormattedValue"];
                var _po_hclentity_value_lookuplogicalname = results["_po_hclentity_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                if (_po_hclentity_value != null) {
                    formContext.getAttribute(targetFieldName).setValue([{
                        entityType: _po_hclentity_value_lookuplogicalname,
                        id: _po_hclentity_value,
                        name: _po_hclentity_value_formatted
                    }]);
                }
                //}
            } else {
                var alertStrings = { confirmButtonLabel: "Ok", text: this.statusText, title: "Error" };
                Xrm.Navigation.openAlertDialog(alertStrings);
            }
        }
    };
    req.send();
} // end  CRM-10080