// OnLoad Function to initialize logic
function onLoad(executionContext) {
    filterCountryByRegions(executionContext);
    contactsdetails(executionContext);
    contactdetails(executionContext); // Sets company name and contact from account
    contactCompanyNameOnly(executionContext); // Sets only company name from account
}

// Function to filter countries based on selected region(s)
// Function to filter countries based on selected region(s) using Global Option Set fields (multi-select)
function filterCountryByRegions(executionContext) {
    var formContext = executionContext.getFormContext();

    // Use the correct schema names for your global option set fields
    var regionAttribute = formContext.getAttribute("tata_regions");      // Global OptionSet (MultiSelect) for Region
    var countryAttribute = formContext.getAttribute("tata_country");    // Global OptionSet (MultiSelect) for Country
    var countryControl = formContext.getControl("tata_country");// Control for Country

    // Defensive checks
    if (!regionAttribute || !countryAttribute || !countryControl) return;

    // Multi-select values are arrays of integer option values
    var selectedRegions = regionAttribute.getValue();

    // Map region option value(s) to allowed country option value(s)
    var regionToCountryMap = {
        1: [1, 2], // LATAM
        2: [3],    // WESTERN EUROPE
        3: [4],    // APAC
        4: [5],    // NAM
        5: [6],    // EASTERN EUROPE
        6: [7]     // MIDDLE EAST
    };

    var allowedCountries = [];
    if (Array.isArray(selectedRegions) && selectedRegions.length > 0) {
        selectedRegions.forEach(function (region) {
            var countries = regionToCountryMap[region];
            if (countries && countries.length > 0) {
                allowedCountries = allowedCountries.concat(countries);
            }
        });
        // Remove duplicates
        allowedCountries = Array.from(new Set(allowedCountries));
    }

    // Clear all country options first
    countryControl.clearOptions();

    // Repopulate country options if any allowed
    if (allowedCountries.length > 0) {
        var allCountryOptions = countryAttribute.getOptions();
        allCountryOptions.forEach(function (option) {
            if (allowedCountries.includes(option.value)) {
                countryControl.addOption(option);
            }
        });
    }

    // Remove value if currently selected country(ies) is/are no longer allowed
    var selectedCountries = countryAttribute.getValue(); // This will be an array for multi-select
    if (selectedCountries !== null && selectedCountries !== undefined) {
        if (Array.isArray(selectedCountries)) {
            var filtered = selectedCountries.filter(function (val) {
                return allowedCountries.includes(val);
            });
            // If none of the selected countries are allowed, clear the value; else set filtered
            countryAttribute.setValue(filtered.length > 0 ? filtered : null);
        } else {
            // Defensive: in case single value, handle as single select
            if (!allowedCountries.includes(selectedCountries)) {
                countryAttribute.setValue(null);
            }
        }
    }
}

// Example OnLoad registration function for a Model-Driven App form
function formOnLoad(executionContext) {
    var formContext = executionContext.getFormContext();

    // Run filter on load
    filterCountryByRegions(executionContext);

    // Register OnChange for the region multi-select global option set
    var regionAttribute = formContext.getAttribute("tata_regions");
    if (regionAttribute) {
        regionAttribute.removeOnChange(filterCountryByRegions);
        regionAttribute.addOnChange(filterCountryByRegions);
    }
}
// Function to populate lead fields from contact
function contactsdetails(executionContext) {
    try {
        var formContext = executionContext.getFormContext();
        var contactLookup = formContext.getAttribute("parentcontactid")?.getValue();

        if (contactLookup && contactLookup.length > 0) {
            var contactId = contactLookup[0].id.replace(/[{}]/g, "");

            Xrm.WebApi.online.retrieveRecord("contact", contactId, "?$select=firstname,lastname").then(
                function success(result) {
                    formContext.getAttribute("firstname").setValue(result.firstname || null);
                    formContext.getAttribute("lastname").setValue(result.lastname || null);
                },
                function (error) {
                    Xrm.Utility.alertDialog("Error retrieving contact: " + error.message);
                }
            );
        } else {
            formContext.getAttribute("firstname").setValue(null);
            formContext.getAttribute("lastname").setValue(null);
        }
    } catch (error) {
        console.error("Error in contactsdetails:", error.message);
    }
}

// Function to set company name and contact info based on account
function contactdetails(executionContext) {
    try {
        var formContext = executionContext.getFormContext();
        var accountLookup = formContext.getAttribute("tata_account")?.getValue();

        if (accountLookup && accountLookup.length > 0) {
            var accountId = accountLookup[0].id.replace(/[{}]/g, "");

            Xrm.WebApi.online.retrieveRecord(
                "account",
                accountId,
                "?$select=name,_primarycontactid_value&$expand=primarycontactid($select=firstname,lastname)"
            ).then(
                function success(result) {
                    formContext.getAttribute("companyname").setValue(result.name || null);

                    if (result.primarycontactid) {
                        var firstname = result.primarycontactid.firstname || "";
                        var lastname = result.primarycontactid.lastname || "";

                        formContext.getAttribute("firstname").setValue(firstname || null);
                        formContext.getAttribute("lastname").setValue(lastname || null);

                        if (result._primarycontactid_value) {
                            var contactId = result._primarycontactid_value;
                            var contactName = firstname + " " + (lastname || "");
                            var lookupValue = [{
                                id: contactId,
                                name: contactName.trim(),
                                entityType: "contact"
                            }];
                            formContext.getAttribute("tata_contact").setValue(lookupValue);
                        }
                    }
                },
                function (error) {
                    Xrm.Utility.alertDialog("Error retrieving account record: " + error.message);
                }
            );
        } else {
            formContext.getAttribute("companyname").setValue(null);
        }
    } catch (error) {
        console.error("Error in contactdetails:", error.message);
    }
}

// Function to set only company name from selected account
function contactCompanyNameOnly(executionContext) {
    try {
        var formContext = executionContext.getFormContext();
        var accountLookup = formContext.getAttribute("tata_account")?.getValue();

        if (accountLookup && accountLookup.length > 0) {
            var accountId = accountLookup[0].id.replace(/[{}]/g, "");

            Xrm.WebApi.online.retrieveRecord(
                "account",
                accountId,
                "?$select=name"
            ).then(
                function success(result) {
                    if (result.name) {
                        formContext.getAttribute("companyname").setValue(result.name);
                    } else {
                        formContext.getAttribute("companyname").setValue(null);
                    }
                },
                function (error) {
                    Xrm.Utility.alertDialog("Error retrieving account record: " + error.message);
                    formContext.getAttribute("companyname").setValue(null);
                }
            );
        } else {
            formContext.getAttribute("companyname").setValue(null);
        }
    } catch (error) {
        console.error("Error in contactCompanyNameOnly:", error.message);
    }
}
