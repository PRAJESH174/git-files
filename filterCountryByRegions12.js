function filterCountryByRegions(executionContext) {
    var formContext = executionContext.getFormContext();
    var regionAttribute = formContext.getAttribute("hp_regionpresence");
    var countryAttribute = formContext.getAttribute("hp_countrypresence");
    var countryControl = formContext.getControl("hp_countrypresence");
 
    // Defensive checks
    if (!regionAttribute || !countryAttribute || !countryControl) return;
 
    var selectedRegions = regionAttribute.getValue(); // Array of selected region values
 
    // Mapping of Region to Countries
    var regionToCountryMap = {
        1: [1, 2], // LATAM
        2: [3],    // WESTERN EUROPE
        3: [4],    // APAC
        4: [5],    // NAM
        5: [6],    // EASTERN EUROPE
        6: [7]     // MIDDLE EAST
    };
 
    // Collect all allowed countries for selected regions
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
 
    // Clear all options first
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
 
    // Remove value if currently selected country is no longer allowed
    var selectedCountry = countryAttribute.getValue();
    if (selectedCountry !== null && selectedCountry !== undefined) {
        // For single select
        if (!allowedCountries.includes(selectedCountry)) {
            countryAttribute.setValue(null);
        }
        // For multi-select (if applicable)
        if (Array.isArray(selectedCountry)) {
            var filteredCountries = selectedCountry.filter(function (value) {
                return allowedCountries.includes(value);
            });
            if (filteredCountries.length !== selectedCountry.length) {
                countryAttribute.setValue(filteredCountries.length > 0 ? filteredCountries : null);
            }
        }
    }
}






//contacts

function contactsdetails(executionContext) {
    debugger;
    try {
        var formContext = executionContext.getFormContext();
        var contactLookup = formContext.getAttribute("parentcontactid")?.getValue();
 
        if (contactLookup && contactLookup.length > 0) {
            // Contact is selected
            var contactId = contactLookup[0].id.replace(/[{}]/g, "");
 
            Xrm.WebApi.online.retrieveRecord("contact", contactId, "?$select=firstname,lastname").then(
                function success(result) {
                    var firstname = result.firstname || null;
                    var lastname = result.lastname || null;
 
                    formContext.getAttribute("firstname").setValue(firstname);
                    formContext.getAttribute("lastname").setValue(lastname);
                },
                function (error) {
                    Xrm.Utility.alertDialog("Error retrieving contact record: " + error.message);
                }
            );
        } else {
            // Contact is removed — clear first name and last name
            formContext.getAttribute("firstname").setValue(null);
            formContext.getAttribute("lastname").setValue(null);
        }
    } catch (error) {
        console.error("Error in contactsdetails:", error.message);
    }
}