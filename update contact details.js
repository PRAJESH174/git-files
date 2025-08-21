// Onload function (runs when the form loads)
function onload(executionContext) {
    try {
        var formContext = executionContext.getFormContext();
        var parentCustomer = formContext.getAttribute("parentcustomerid");

        if (parentCustomer) {
            parentCustomer.addOnChange(contactdetails);

            // Call contactdetails on load if the Account lookup already has a value.
            if (parentCustomer.getValue()) {
                contactdetails(executionContext);
            }
        }
    } catch (error) {
        console.error("Error in onload function:", error);
        Xrm.Utility.alertDialog("An error occurred in the onload function: " + error.message);
    }
}

// Function to fetch and update contact details based on the selected account
async function contactdetails(executionContext) {
    try {
        var formContext = executionContext.getFormContext();
        var accountLookup = formContext.getAttribute("parentcustomerid").getValue();

        if (!accountLookup || accountLookup.length === 0) {
            clearFields(formContext);
            return;
        }

        var accountId = accountLookup[0].id.replace(/[{}]/g, "");
        const accountQuery = `?$select=address1_city,address1_country,address1_telephone2&$filter=accountid eq '${accountId}'`;
        
        const accountResult = await Xrm.WebApi.online.retrieveMultipleRecords("account", accountQuery);
        
        if (!accountResult || accountResult.entities.length === 0) {
            clearFields(formContext);
            return;
        }

        var account = accountResult.entities[0];
        
        if (formContext.data.entity.getId()) { // Existing Contact record
            var contactId = formContext.data.entity.getId().replace(/[{}]/g, "");
            const contactQuery = `?$select=address1_city,address1_country,address1_telephone2&$filter=contactid eq '${contactId}'`;
            
            const contactResult = await Xrm.WebApi.online.retrieveMultipleRecords("contact", contactQuery);

            if (contactResult && contactResult.entities.length > 0) {
                var contactToUpdate = contactResult.entities[0];
                contactToUpdate.address1_city = account.address1_city;
                contactToUpdate.address1_country = account.address1_country;
                contactToUpdate.address1_telephone2 = account.address1_telephone2;
                
                await Xrm.WebApi.online.updateRecord("contact", contactToUpdate.contactid, contactToUpdate);
                formContext.data.refresh(true);
            }
        } else { // New Contact record
            formContext.getAttribute("new_account_city").setValue(account.address1_city);
            formContext.getAttribute("new_account_country").setValue(account.address1_country);
            formContext.getAttribute("new_account_telephone2").setValue(account.address1_telephone2);
        }
    } catch (error) {
        console.error("Error in contactdetails function:", error);
        Xrm.Utility.alertDialog("An error occurred in the contactdetails function: " + error.message);
    }
}

// Clears address fields on the Contact form
function clearFields(formContext) {
    try {
        formContext.getAttribute("address1_city").setValue(null);
        formContext.getAttribute("address1_country").setValue(null);
        formContext.getAttribute("address1_telephone2").setValue(null);
    } catch (error) {
        console.error("Error in clearFields function:", error);
        Xrm.Utility.alertDialog("An error occurred in the clearFields function: " + error.message);
    }
}

// Runs when the Contact record is saved
function onContactSave(executionContext) {
    try {
        var formContext = executionContext.getFormContext();
        
        // Retrieve values from custom fields
        var city = formContext.getAttribute("new_account_city").getValue();
        var country = formContext.getAttribute("new_account_country").getValue();
        var phone = formContext.getAttribute("new_account_telephone2").getValue();
        
        // Set the standard address fields
        formContext.getAttribute("address1_city").setValue(city);
        formContext.getAttribute("address1_country").setValue(country);
        formContext.getAttribute("address1_telephone2").setValue(phone);

        // Clear the custom fields after use
        formContext.getAttribute("new_account_city").setValue(null);
        formContext.getAttribute("new_account_country").setValue(null);
        formContext.getAttribute("new_account_telephone2").setValue(null);
    } catch (error) {
        console.error("Error in onContactSave function:", error);
        Xrm.Utility.alertDialog("An error occurred in the onContactSave function: " + error.message);
    }
}
