// QuoteLibrary Script

// Triggered when the form loads
function onLoad(ctx) {
    // Validate and close the form if necessary
    formValidateAndClose(ctx);
    
    // Get the form context
    var formContext = ctx.getFormContext();
    
    // Clear form notifications
    formContext.ui.clearFormNotification();

    // Collapse tab_2 if it exists
    if (formContext.ui.tabs.get("tab_2"))
        formContext.ui.tabs.get("tab_2").setDisplayState("collapsed");
    
    // Handle change in EcommId field
    onChangeEcommId(ctx);
    
    // Show notifications related to the address ID
    ShowNotificationForAddressId(ctx);
    
    // Set CRM address information for the payer
    setPayerCrmAddressInfo(ctx);
    
    // Show or hide user forecast criteria
    ShowHideUserForecastCriteria(ctx);
    
    // Set payment terms
    setPaymentTerms(ctx);
    
    // Show notifications related to quote expiration
    quoteExpNotification(ctx);
    
    // Provide tax advice notifications
    quoteTaxAdvice(ctx);
    
    // Display tax total amount notifications
    quoteTaxTotalAmount(ctx);
    
    // Show or hide the Edit Quote tab
    ShowHideEditQuoteTab(ctx);
    
    // Validate address information
    validateAddress(ctx);
    
    // Update the grid based on perpetual term length
    UpdatePerpetualTermLengthGrid(ctx);
    
    // Check if PO file is available to download
    checkPoAvailable(ctx);

    // Refresh the bulk update web resource
    refreshBulkUpdate();

    // Check for retired products in the quote
    RetiredProductCheckQuote(ctx);
}

// Refresh the bulk update web resource
function refreshBulkUpdate() {
    // Define a function for bulk update on web resource load
    var bulkUpdateWROnloadFunction = function (e) {
        debugger;
        var webResourceControl = Xrm.Page.getControl("WebResource_globalDiscount");
        var src = Xrm.Page.getControl("WebResource_globalDiscount").getSrc();
        src = src.substr(0, src.length - 2) + Math.floor(Math.random() * (99 - 10 + 1) + 10);
        webResourceControl.setSrc(src);
    };

    // Set the source URL for the global discount web resource
    Xrm.Page.getControl("WebResource_globalDiscount").setSrc(Xrm.Page.getControl("WebResource_globalDiscount").getSrc() + "11");
    // Add the bulk update onload function
    Xrm.Page.getControl("QP_2").addOnLoad(bulkUpdateWROnloadFunction);
}

// Temporarily fix for Quote Revise Button to avoid multiple clicks
function quoteRevise() {
    // Show progress indicator
    Xrm.Utility.showProgressIndicator("The Process might take a minute, avoid clicking Revise multiple times..");
    // Delay the actual revision
    setTimeout(quoteReviseDelay, 5000);
}

// Delayed function for quote revise
function quoteReviseDelay() {
    // Close progress indicator
    Xrm.Utility.closeProgressIndicator();
    // Display a message after the delay
    // Xrm.Navigation.openAlertDialog("The Process might take a minute, please wait until the process is complete.");
}

// Validate the form and close if necessary
function formValidateAndClose(ctx) {
    var formContext = ctx.getFormContext();
    var recordId = formContext.data.entity.getId();

    if (!recordId) {
        // Show an alert if the quote is not created from Opportunity record's sub-grid
        var alertStrings = { confirmButtonLabel: "Ok", text: "Please create the quote from Opportunity record's sub-grid", title: "ERROR!" };
        var alertOptions = { height: 120, width: 500 };
        
        // Open alert dialog and handle success
        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
            function success(result) {
                debugger;
                // Prevent the save popup
                var attributes = formContext.data.entity.attributes.get();
                for (var x in attributes) {
                    attributes[x].setSubmitMode("never");
                }
                debugger;
                // Close the form
                formContext.ui.close();
            },
            // Handle error
            function (error) {
                console.log(error.message);
            }
        );
    }
}

// onSave event handler for the quote form
function quote_onSave(ctx) {
    var formContext = ctx.getFormContext();
    
    // Ensure no updates when the form is disabled
    if (formContext.ui.getFormType() == 4) {
        formContext.data.setFormDirty(false);
    }
}

// Handle change in EcommId field and display notifications
function onChangeEcommId(ctx) {
    var formContext = ctx.getFormContext();

    if (formContext.getAttribute("po_ecommid").getValue() &&
        !formContext.getAttribute("po_quoteinternal").getValue() &&
        formContext.getAttribute("statecode").getValue() == 1)
        formContext.ui.setFormNotification("The quote is published to ecommerce.", "INFO", "ecommpub");
    else
        formContext.ui.clearFormNotification("ecommpub");
}

// Display a warning notification if the Quote Expiration Date is missing or has passed
function quoteExpNotification(ctx) {
    var formContext = ctx.getFormContext();

    if (!formContext.getAttribute("effectiveto"))
        return;

    var date = new Date();

    // Override OOB expiration date notification
    if (formContext.getAttribute("effectiveto").getValue() < date) {
        setTimeout(function () {
            formContext.ui.setFormNotification("The \"Quote Expiration Date\" does not contain data or has passed, please update to a future date.", "WARNING", "QuoteExpiryNotification");
        }, 200)
    }
}

// Provide tax advice notifications based on the billing country
function quoteTaxAdvice(ctx) {
    var formContext = ctx.getFormContext();
    var countryName = formContext.getAttribute("billto_country").getValue();

    Xrm.WebApi.online.retrieveMultipleRecords("po_country", "?$select=po_taxcalculationadvice&$filter=po_name eq '" + countryName + "' and statecode eq 0").then(
        function success(results) {
            for (var i = 0; i < results.entities.length; i++) {
                var po_taxcalculationadvice = results.entities[i]["po_taxcalculationadvice@OData.Community.Display.V1.FormattedValue"];

                if (po_taxcalculationadvice != undefined && po_taxcalculationadvice == "Recommend TO Calculate") {
                    formContext.ui.setFormNotification("It is recommended TO calculate taxes at this stage when transacting with a customer in " + countryName, "INFO", "QuoteTaxNotification");
                } else if (po_taxcalculationadvice != undefined && po_taxcalculationadvice == "Recommend to NOT Calculate") {
                    formContext.ui.setFormNotification("It is recommended to NOT calculate taxes at this stage when transacting with a customer in " + countryName, "INFO", "QuoteTaxNotification");
                } else {
                    formContext.ui.clearFormNotification("QuoteTaxNotification");
                }
            }
        },
        // Handle error
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}

// Display a notification if the total amount on the quote has been changed
function quoteTaxTotalAmount(ctx) {
    var formContext = ctx.getFormContext();
    var totalAmountChanged = formContext.getAttribute("po_totalamountchanged").getValue();

    if (totalAmountChanged == null || totalAmountChanged == false) {
        formContext.ui.clearFormNotification("QuoteTaxTotalAmount");
    } else if (totalAmountChanged == true) {
        formContext.ui.setFormNotification("Quote Amount is updated on Quote it is recommended to re-calculate tax.", "WARNING", "QuoteTaxTotalAmount");
    }
}

// Provide a warning if subscription term length is not equal to product term lengths
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
                    } else {
                        formContext.ui.clearFormNotification("1");
                        formContext.ui.clearFormNotification("4");
                        return;
                    }
                } else if (results.value.length > 1) {
                    for (var i = 0; i < results.value.length; i++) {
                        var po_termlength = results.value[i]["po_termlength"];
                        if (subscriptiontermlength != results.value[i]["po_termlength"]) {
                            formContext.ui.setFormNotification("Quote length and Products length are not equal", "WARNING", "4");
                            return;
                        } else if (subscriptiontermlength == results.value[i]["po_termlength"]) {
                            for (var j = 1; j < results.value.length; j++) {
                                if (results.value[i]["po_termlength"] != results.value[j]["po_termlength"]) {
                                    formContext.ui.setFormNotification("Quote length and Products length are not equal", "WARNING", "4");
                                    return;
                                } else {
                                    formContext.ui.clearFormNotification("1");
                                    formContext.ui.clearFormNotification("4");
                                    return;
                                }
                            }
                        }
                    }
                }
            } else {
                Xrm.Navigation.openAlertDialog({ text: this.statusText, confirmButtonLabel: "Ok" }, { height: 100, width: 200 });
            }
        }
    };

    req.send();
    formContext.ui.refreshRibbon();
}

// Check conditions to show or hide the "Activate Quote" option
function showActivateQuote(executionContext) {
    var invoicingFrequency = executionContext.data.entity.attributes.getByName('po_invoicingfrequency').getValue();
    var contractAuthorizationStatus = executionContext.data.entity.attributes.getByName('po_contractauthorizationstatus').getValue();
    var catKif = executionContext.data.entity.attributes.getByName('po_catkif').getValue();
    var vatTaxId = executionContext.data.entity.attributes.getByName('po_vattaxid').getValue();

    if (invoicingFrequency == "936710000" && contractAuthorizationStatus == "936710010" && catKif != null && vatTaxId != null)
        return true;
    else
        return false;
}

// Check conditions for creating an order and display an alert if conditions are not met
function CheckOrder(executionContext) {
    var catKif = executionContext.data.entity.attributes.getByName('po_catkif').getValue();
    var contractAuthorizationStatus = executionContext.data.entity.attributes.getByName('po_contractauthorizationstatus').getValue();

    if (catKif.length != 6 || contractAuthorizationStatus != "936710010") {
        var alertStrings = { confirmButtonLabel: "Close", text: "One or both of the following conditions to Create an Order has not been satisfied.\n 1. The CAT KIF # does not conform to the expected standard, please review the KIF # in CAT and update it. \n 2. The Contract Authorization Status does not reflect a Status of ï¿½Both Parties Signed Copyï¿½ this indicates a fully executed contract is in place.\nAn order has not been created for the reason(s) above and an update to the Quote is needed.\n Please Click on close button and update the form." };
        var alertOptions = { height: 200, width: 500 };
        
        // Open alert dialog and handle success
        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
            function success(result) {
                console.log("Alert dialog closed");
            },
            // Handle error
            function (error) {
                console.log(error.message);
            }
        );
    } else {
        // Accept quote or create order
        Sales.QuoteRibbonActions.Instance.acceptQuoteOrCreateOrder(true);
    }
}

// Function to show or hide a control based on the active Business Process Flow (BPF) stage
function ShowHideUserForecastCriteria(ctx) {
    var formContext = ctx.getFormContext(); // Get the form context
    var hasBpf = formContext.data.process.getActiveStage() !== null; // Check if there is an active BPF stage
    formContext.getControl("po_userupdatedforecastcriteria").setVisible(hasBpf); // Set visibility based on BPF presence
}

// Function to show or hide a tab based on the statecode attribute value
function ShowHideEditQuoteTab(ctx) {
    var formContext = ctx.getFormContext(); // Get the form context
    var statecode = formContext.getAttribute("statecode"); // Get the statecode attribute
    if (!formContext.ui.tabs.getByName("tab_6")) // Check if the tab exists
        return;
    var statecodeVal = typeof statecode.getValue == "function" ? statecode.getValue() : null; // Get the value of statecode
    formContext.ui.tabs.getByName("tab_6").setVisible(statecodeVal == 1); // Set tab visibility based on statecode value
    formContext.data.refresh(); // Refresh the form data
}

// Function to enforce certain conditions based on the invoicing frequency
function EnforceInvoiceFrequency(executionContext) {
    var formContext = executionContext.getFormContext(); // Get the form context
    var invoicingFrequency = formContext.getAttribute("po_invoicingfrequency").getValue(); // Get the invoicing frequency
    if (invoicingFrequency == "936710001" || invoicingFrequency == "936710002" || invoicingFrequency == "936710003") {
        // Add enforcement logic here
    }
}

// Function to show or hide the "Create Order" functionality based on quote state and status
function showHideCreateOrder(executionContext) {
    var quoteState = executionContext.data.entity.attributes.getByName('statecode').getValue(); // Get the quote state
    var quoteStatus = executionContext.data.entity.attributes.getByName('statuscode').getValue(); // Get the quote status
    alert(quoteState); // Displaying quote state (for debugging)
    alert(quoteStatus); // Displaying quote status (for debugging)
    switch (quoteState) {
        // Add logic for each quote state
    }
}

// Function to display a warning if the quote total exceeds the account's available balance
function availableBalanceWarning(executionContext, alertString) {
    // Logic to check available balance against quote total and display a warning
}

// Function to display a warning if the account has a specific delinquency status
function delinquencyStatusWarning(executionContext) {
    var delinquencyStatus = executionContext.getFormContext().getAttribute("po_delinquencystatus").getValue(); // Get the delinquency status
    if (delinquencyStatus == "717790001") {
        var alertString = { text: "This Account is In-Dispute, Delinquency Status" }; // Warning message
        var alertOptions = { height: 120, width: 400 }; // Alert options
        Xrm.Navigation.openAlertDialog(alertString, alertOptions); // Display the warning as an alert
    }
}

// Function to color the delinquency status field based on its value and display a related warning
function colourDelinquencyStatusField(executionContext) {
    var delinquencyStatus = executionContext.getFormContext().getAttribute("po_delinquencystatus").getValue(); // Get the delinquency status
    var alertString = ""; // Initialize alert string
    switch (delinquencyStatus) {
        // Set background color based on delinquency status
    }
    availableBalanceWarning(executionContext, alertString); // Display a warning based on available balance
}

// Function to display a warning message if the total contract value does not meet invoicing requirements
function invoiceFrequencyAlert(executionContext) {
    // Retrieving relevant attributes from the form context
    var subScriptionTermLength = executionContext.getFormContext().getAttribute("ps_subscriptiontermlength").getText();
    var invoicingFrequency = executionContext.getFormContext().getAttribute("po_invoicingfrequency").getValue();
    var totalPaymentAmount = executionContext.getFormContext().getAttribute("totalamount").getValue();
    var alertMsg = "false";

    // Extracting numeric payment periods from subscription term length
    var paymentPeriods = subScriptionTermLength.replace(/[^0-9\.]+/g, "");

    // Checking conditions based on invoicing frequency and total payment amount
    if (totalPaymentAmount != 0 && paymentPeriods != "" && totalPaymentAmount != null) {
        switch (invoicingFrequency) {
            case 936710001:
                if (totalPaymentAmount / 1 * paymentPeriods < 0) {
                    alertMsg = "True";
                }
                break;
            case 936710002:
                if (totalPaymentAmount / 4 * paymentPeriods < 100000) {
                    alertMsg = "True";
                }
                break;
            case 936710003:
                if (totalPaymentAmount / 12 * paymentPeriods < 50000) {
                    alertMsg = "True";
                }
                break;
            default:
                alertMsg = "false";
                break;
        }
        // Displaying an alert if conditions are met
        if (alertMsg == "True") {
            var alertString = { text: " Warning Message(TCV): \n\n Total Contract Value does not Qualify for invoicing requirements.\n\n Invoicing Frequency = Annual then Invoicing Payment > 0 K \n\n Invoicing Frequency = Quarterly then Invoicing Payment > 100K \n\n Invoicing Frequency = Monthly then Invoicing Payment > 50k " };
            var alertOptions = { height: 300, width: 550 };
            Xrm.Navigation.openAlertDialog(alertString, alertOptions);
        }
    }
}

// Function to determine whether to hide the "Quote Print" button
function hideQuotePrintButton(executionContext) {
    // Returning true initially; subsequent code will not be executed
    return true;

    // Retrieving relevant attributes from the form context
    var paymentScheduleamount = executionContext.data.entity.attributes.getByName('ps_paymentscheduleamount').getValue();
    var subscriptiontermlength = executionContext.data.entity.attributes.getByName('ps_subscriptiontermlength').getValue();
    var invoicingFrequency = executionContext.data.entity.attributes.getByName('po_invoicingfrequency').getValue();

    // Checking conditions to determine whether to hide the button
    // (Note: The subsequent code will not be executed due to the earlier return statement)
    if (invoicingFrequency == 936710000) {
        return true;
    }

    // Additional checks based on payment schedule amount and invoicing frequency
    // ...

    // Default case if conditions are not met
    else {
        return false;
    }
}

// Function to display a warning if the quote total amount exceeds the available balance of the associated account
function availableBalanceWarning(executionContext, alertString) {
    // Retrieving relevant attributes from the form context
    var quoteTotalAmount = executionContext.getFormContext().getAttribute('totalamount').getValue();

    if (executionContext.getFormContext().getAttribute("po_account").getValue() != null) {
        // Retrieving additional information from the associated account
        // ...

        // Checking conditions and displaying a warning if necessary
        if (quoteTotalAmount != null && accountPsAvailableBalance != null) {
            if (quoteTotalAmount > accountPsAvailableBalance) {
                alertString += " The Quote Total is greater than the Accounts Available Balance.";
                Xrm.Navigation.openAlertDialog({ text: alertString }, alertOptions);
            } else {
                // Additional actions if conditions are met
            }
        }
        else {
            // Additional actions if conditions are not fully met
        }
    }
    else {
        // Additional actions if account information is not available
    }
}

// Function to perform actions based on changing the invoicing frequency
function changeInvoiceFrequency(executionContext) {
    // Retrieving relevant attributes from the form context
    var invoicingFrequency = executionContext.getFormContext().getAttribute("po_invoicingfrequency").getValue();
    var contractAuthorizationStatus = executionContext.getFormContext().getAttribute("po_contractauthorizationstatus").getValue();
    var catKif = executionContext.getFormContext().getAttribute('po_catkif').getValue();
    var vatTaxId = executionContext.getFormContext().getAttribute('po_vattaxid').getValue();
    var quoteSubScriptionTermLength = executionContext.getFormContext().getAttribute("ps_subscriptiontermlength").getValue();

    // Checking conditions for specific actions
    if (invoicingFrequency != "936710000" && contractAuthorizationStatus == "936710010" && catKif != null && vatTaxId != null) {
        // Retrieving information from the "QP_2" grid and performing actions based on the data
        // ...

        // Iterating through quote details and performing actions
        // ...
    }
}

// Function to display a warning if conditions related to invoicing frequency and payment schedule amount are not met
function quotePrintButtonAlert(executionContext) {
    // Retrieving relevant attributes from the form context
    var formContext = executionContext.getFormContext();
    var paymentScheduleamount = executionContext.getFormContext().getAttribute("ps_paymentscheduleamount").getValue();
    var invoicingFrequency = executionContext.getFormContext().getAttribute("po_invoicingfrequency").getValue();
    var subscriptiontermlength = executionContext.getFormContext().getAttribute("ps_subscriptiontermlength").getValue();

    // Checking conditions related to invoicing frequency and payment schedule amount
    // ...

    // Setting form notifications if conditions are not met
    // ...
}
