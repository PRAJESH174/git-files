function onLoadPopulateLeadName(executionContext) {
    populateLeadNameFromContact(executionContext);
    retrieveLeadContactAssociations(); // Optional logging
}

function populateLeadNameFromContact(executionContext) {
    var formContext = executionContext.getFormContext();
    var contactLookupAttr = formContext.getAttribute("parentcontactid");

    if (!contactLookupAttr || !contactLookupAttr.getValue()) {
        clearLeadNameFields(formContext);
        console.log("Contact lookup is empty, Lead name fields cleared.");
        return;
    }

    var contact = contactLookupAttr.getValue()[0];
    if (!contact || !contact.id) {
        clearLeadNameFields(formContext);
        console.log("Invalid contact data, Lead name fields cleared.");
        return;
    }

    var contactId = contact.id.replace(/[{}]/g, '');

    Xrm.WebApi.retrieveRecord("contact", contactId, "?$select=firstname,lastname").then(
        function success(result) {
            var contactFirstName = result["firstname"] || "";
            var contactLastName = result["lastname"] || "";

            if (formContext.getAttribute("firstname")) {
                formContext.getAttribute("firstname").setValue(contactFirstName);
            }
            if (formContext.getAttribute("lastname")) {
                formContext.getAttribute("lastname").setValue(contactLastName);
            }

            console.log("Lead name populated from Contact: " + contactFirstName + " " + contactLastName);
        },
        function (error) {
            console.error("Error retrieving contact details: " + error.message);
            Xrm.Navigation.alertDialog(
                "Could not fetch contact information. Please try again or contact support.\nError: " + error.message
            );
            clearLeadNameFields(formContext);
        }
    );
}

function clearLeadNameFields(formContext) {
    if (formContext.getAttribute("firstname")) {
        formContext.getAttribute("firstname").setValue(null);
    }
    if (formContext.getAttribute("lastname")) {
        formContext.getAttribute("lastname").setValue(null);
    }
}

function retrieveLeadContactAssociations() {
    Xrm.WebApi.retrieveMultipleRecords("lead", "?$select=_contactid_value,firstname,lastname").then(
        function success(results) {
            console.log("Leads retrieved: ", results.entities.length);

            for (var i = 0; i < results.entities.length; i++) {
                var result = results.entities[i];
                var leadId = result["leadid"];
                var contactId = result["_contactid_value"];
                var contactName = result["_contactid_value@OData.Community.Display.V1.FormattedValue"];
                var contactLogicalName = result["_contactid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                var leadFirstName = result["firstname"];
                var leadLastName = result["lastname"];

                console.log(`LeadID: ${leadId}`);
                console.log(`Associated Contact: ${contactName} (${contactId}) [${contactLogicalName}]`);
                console.log(`Lead Name: ${leadFirstName} ${leadLastName}`);
            }
        },
        function (error) {
            console.error("Error retrieving leads: ", error.message);
        }
    );
}

function companydetails(executionContext) {
    debugger;
    try {
  var formContext = executionContext.getFormContext();
        var accountLookup = formContext.getAttribute("tata_account")?.getValue();
        if(accountLookup!=null) {
         var accountId = accountLookup[0].id.replace(/[{}]/g, "");

Xrm.WebApi.online.retrieveRecord("account", accountId, "?$select=name,_primarycontactid_value&$expand=primarycontactid($select=firstname,lastname)").then(
    function success(result) {
        var name = result.name;
        if(name!=null){
            formContext.getAttribute("companyname").setValue(name);
        }
        var firstname = result.primarycontactid.firstname;
        if(firstname!=null) {
            formContext.getAttribute("firstname").setValue(firstname);
        }
            var lastname = result.primarycontactid.lastname;
            if(lastname!=null) {
                formContext.getAttribute("lastname").setValue(lastname);
            }
            var contact = result._primarycontactid_value;
            if(contact!=null) {
                formContext.getAttribute("tata_contact").setValue(contact);
            }
    },
    function(error) {
        Xrm.Utility.alertDialog(error.message);
    }
);
        }

 } catch (error) {
        console.error("Error in contactdetails:", error.message);
    }
}




function contactsdetails(executionContext) {
    debugger;
    try {
  var formContext = executionContext.getFormContext();
        var accountLookup = formContext.getAttribute("tata_contact")?.getValue();
        if(accountLookup!=null) {
         var accountId = accountLookup[0].id.replace(/[{}]/g, "");

Xrm.WebApi.online.retrieveRecord("contact", accountId, "?$select=firstname,lastname").then(
    function success(result) {
        var firstname = result.firstname;
        if(firstname!=null) {
            formContext.getAttribute("firstname").setValue(firstname);
        }
            var lastname = result.lastname;
            if(lastname!=null) {
                formContext.getAttribute("lastname").setValue(lastname);
            }
    },
    function(error) {
        Xrm.Utility.alertDialog(error.message);
    }
);
        }

 } catch (error) {
        console.error("Error in contactdetails:", error.message);
    }
}
