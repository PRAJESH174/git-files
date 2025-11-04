function NewServiceOrder(PrimaryControl) {
    debugger;
    Xrm.Utility.showProgressIndicator("New Service Order is InProgress");
    var formContext = PrimaryControl;
    var Originvalue = formContext.getAttribute("cs_origin").getValue();
    
    // Configuration keys for New Service Order
    var serviceOrderConfigKey = "APNS New Service Order Base URL";
    var serviceOrderUsername = "APNS New Service Order Username";
    var serviceOrderPassword = "APNS New Service Order Password";
    
    // Extract case number
    var Casenumber = formContext.getAttribute("ticketnumber").getValue();
    var varCaseNo = Casenumber.substring(4, Casenumber.length);
    
    // Check for interact case number
    if (formContext.getAttribute("cs_interactcasenumber").getValue() != null) {
        varCaseNo = formContext.getAttribute("cs_interactcasenumber").getValue();
    }
    
    // Extract all required fields from ICON as per documentation
    var iconData = extractICONData(formContext);
    
    // Validate mandatory fields
    if (!validateMandatoryFields(iconData)) {
        Xrm.Utility.closeProgressIndicator();
        var alertStrings = { 
            confirmButtonLabel: "OK", 
            text: "Mandatory fields are missing. Please check Case Number and required data.", 
            title: "Validation Error" 
        };
        var alertOptions = { height: 120, width: 300 };
        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
        return;
    }
    
    if (Originvalue != null) {
        var origin = Originvalue[0].id;
        var originName = Originvalue[0].name;
        var origincode = origin.replace('{', '').replace('}', '');
        
        // Step 1: Get Base URL
        retrieveConfiguration(serviceOrderConfigKey, null, origincode)
            .then(function(baseUrl) {
                if (!baseUrl) {
                    throw new Error("Configuration value is not defined for key: " + serviceOrderConfigKey);
                }
                
                // Step 2: Get Username
                return Promise.all([
                    Promise.resolve(baseUrl),
                    retrieveConfiguration(serviceOrderUsername, origincode, null)
                ]);
            })
            .then(function(results) {
                var baseUrl = results[0];
                var username = results[1];
                if (!username) {
                    throw new Error("Configuration is not maintained for this origin: " + serviceOrderUsername);
                }
                
                // Step 3: Get Password
                return Promise.all([
                    Promise.resolve(baseUrl),
                    Promise.resolve(username),
                    retrieveConfiguration(serviceOrderPassword, origincode, null)
                ]);
            })
            .then(function(results) {
                var baseUrl = results[0];
                var username = results[1];
                var password = results[2];
                
                if (!password) {
                    throw new Error("Configuration is not maintained for this origin: " + serviceOrderPassword);
                }
                
                // Build URL with all ICON data
                var fullUrl = buildServiceOrderURL(baseUrl, username, password, varCaseNo, iconData);
                
                console.log("New Service Order URL:  Untitled1:81 - function NewServiceOrder(PrimaryControl).js:81" + fullUrl);
                Xrm.Utility.closeProgressIndicator();
                
                // Open ASC Lite page with populated data
                Xrm.Navigation.openUrl(fullUrl);
            })
            .catch(function(error) {
                Xrm.Utility.closeProgressIndicator();
                showErrorAlert(error.message);
                console.log(error.message);
            });
    } else {
        Xrm.Utility.closeProgressIndicator();
        var alertStrings = { 
            confirmButtonLabel: "OK", 
            text: "Origin cannot be null.", 
            title: "Error" 
        };
        var alertOptions = { height: 120, width: 260 };
        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
    }
}
function retrieveConfiguration(configKey, originCode, useBaseUrlFilter) {
    var filter = "cs_configurationkey eq '" + configKey + "'";
    
    if (originCode) {
        filter = "(cs_configurationname eq '" + configKey + "' and _cs_origin_value eq " + originCode + ")";
    }
    
    return Xrm.WebApi.online.retrieveMultipleRecords("cs_configuration", 
        "?$select=cs_configurationvalue,cs_configurationname&$filter=(" + filter + ")")
        .then(function(results) {
            if (results.entities.length > 0) {
                return results.entities[0]["cs_configurationvalue"];
            }
            return null;
        });
}

// Extract ICON data from case form
function extractICONData(formContext) {
    var iconData = {};
    
    iconData.origin = getFieldValue(formContext, "cs_origin", "text");
    iconData.iconAccountNo = getFieldValue(formContext, "cs_iconaccountno", "text");
    iconData.ccAgentName = getFieldValue(formContext, "cs_ccagentname", "text");
    iconData.caseOrigin = getFieldValue(formContext, "cs_caseorigin", "text");
    iconData.iconCaseNo = getFieldValue(formContext, "cs_iconcaseno", "text");
    iconData.firstName = getFieldValue(formContext, "cs_firstname", "text");
    iconData.lastName = getFieldValue(formContext, "cs_lastname", "text");
    iconData.contactMobilePhone = getFieldValue(formContext, "cs_contactmobilephone", "text");
    iconData.caseDescription = getFieldValue(formContext, "description", "text");
    iconData.contactHomePhone = getFieldValue(formContext, "cs_contacthomephone", "text");
    iconData.contactPrimaryEmail = getFieldValue(formContext, "cs_contactprimaryemail", "text");
    iconData.contactSecondaryEmail = getFieldValue(formContext, "cs_contactsecondaryemail", "text");
    iconData.modelName = getFieldValue(formContext, "cs_modelname", "text");
    iconData.modelCode8D = getFieldValue(formContext, "cs_modelcode8d", "text");
    iconData.unitSerialNumber = getFieldValue(formContext, "cs_unitserialnumber", "text");
    iconData.caseAction = getFieldValue(formContext, "cs_caseaction", "text");
    iconData.addressState = getFieldValue(formContext, "cs_addressstate", "text");
    iconData.addressCity = getFieldValue(formContext, "cs_addresscity", "text");
    iconData.addressPostcode = getFieldValue(formContext, "cs_addresspostcode", "text");
    iconData.addressStreet = getFieldValue(formContext, "cs_addressstreet", "text");
    
    // Trim case description to 2000 characters as per requirement
    if (iconData.caseDescription && iconData.caseDescription.length > 2000) {
        iconData.caseDescription = iconData.caseDescription.substring(0, 2000);
    }
    
    return iconData;
}

// Get field values safely
function getFieldValue(formContext, fieldName, type) {
    var attribute = formContext.getAttribute(fieldName);
    if (attribute != null) {
        var value = attribute.getValue();
        if (value != null) {
            if (type === "lookup" && value.length > 0) {
                return value[0].name;
            }
            return value.toString();
        }
    }
    return "";
}

// Validate mandatory fields as per documentation
function validateMandatoryFields(iconData) {
    var mandatoryFields = [
        "origin",
        "iconAccountNo",
        "caseOrigin",
        "iconCaseNo",
        "firstName",
        "lastName",
        "contactMobilePhone",
        "caseDescription"
    ];
    
    for (var i = 0; i < mandatoryFields.length; i++) {
        if (!iconData[mandatoryFields[i]] || iconData[mandatoryFields[i]] === "") {
            return false;
        }
    }
    
    return true;
}

// Build complete URL with all parameters
function buildServiceOrderURL(baseUrl, username, password, caseNo, iconData) {
    var url = baseUrl;
    url += "j_username=" + encodeURIComponent(username);
    url += "&j_password=" + encodeURIComponent(password);
    url += "&jumpPage=serviceOrder";
    url += "&interactCaseNo=" + encodeURIComponent(caseNo);
    
    // Add all ICON data as URL parameters
    url += "&origin=" + encodeURIComponent(iconData.origin);
    url += "&iconAccountNo=" + encodeURIComponent(iconData.iconAccountNo);
    url += "&ccAgentName=" + encodeURIComponent(iconData.ccAgentName);
    url += "&caseOrigin=" + encodeURIComponent(iconData.caseOrigin);
    url += "&iconCaseNo=" + encodeURIComponent(iconData.iconCaseNo);
    url += "&firstName=" + encodeURIComponent(iconData.firstName);
    url += "&lastName=" + encodeURIComponent(iconData.lastName);
    url += "&contactMobile=" + encodeURIComponent(iconData.contactMobilePhone);
    url += "&caseDescription=" + encodeURIComponent(iconData.caseDescription);
    url += "&contactHomePhone=" + encodeURIComponent(iconData.contactHomePhone);
    url += "&contactPrimaryEmail=" + encodeURIComponent(iconData.contactPrimaryEmail);
    url += "&contactSecondaryEmail=" + encodeURIComponent(iconData.contactSecondaryEmail);
    url += "&modelName=" + encodeURIComponent(iconData.modelName);
    url += "&modelCode=" + encodeURIComponent(iconData.modelCode8D);
    url += "&serialNumber=" + encodeURIComponent(iconData.unitSerialNumber);
    url += "&caseAction=" + encodeURIComponent(iconData.caseAction);
    url += "&addressState=" + encodeURIComponent(iconData.addressState);
    url += "&addressCity=" + encodeURIComponent(iconData.addressCity);
    url += "&addressPostcode=" + encodeURIComponent(iconData.addressPostcode);
    url += "&addressStreet=" + encodeURIComponent(iconData.addressStreet);
    
    return url;
}

// Show error alert helper
function showErrorAlert(message) {
    var alertStrings = { 
        confirmButtonLabel: "OK", 
        text: message, 
        title: "Error" 
    };
    var alertOptions = { height: 120, width: 300 };
    Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
}
async function EnableNewServiceOrder(primaryControl) {
    debugger;
    var formContext = primaryControl;
    var returnvalue = false;
    var userid = Xrm.Utility.getGlobalContext().userSettings.userId.replace(/{|}/gi, "");
    
    console.log("User ID:  Untitled1:245 - function NewServiceOrder(PrimaryControl).js:239" + userid);
    
    var Originvalue = formContext.getAttribute("cs_origin").getValue();
    
    if (Originvalue == null) {
        return false;
    }
    
    var origin = Originvalue[0].id;
    
    try {
        var results = await Xrm.WebApi.retrieveMultipleRecords("cs_configuration", 
            "?$select=cs_configurationvalue&$filter=(_cs_origin_value eq " + origin + " and cs_configurationname eq 'Enable New Service Order')");
        
        console.log(results);
        
        if (results.entities.length > 0) {
            for (var i = 0; i < results.entities.length; i++) {
                var result = results.entities[i];
                var cs_configurationvalue = result["cs_configurationvalue"];
                
                if (cs_configurationvalue == "Enable") {
                    console.log("New Service Order button enabled  Untitled1:267 - function NewServiceOrder(PrimaryControl).js:261");
                    returnvalue = true;
                    break;
                }
            }
        }
    } catch (error) {
        console.log("Error retrieving configuration:  Untitled1:274 - function NewServiceOrder(PrimaryControl).js:268" + error.message);
    }
    
    console.log("Enable New Service Order return value:  Untitled1:277 - function NewServiceOrder(PrimaryControl).js:271" + returnvalue);
    return returnvalue;
}